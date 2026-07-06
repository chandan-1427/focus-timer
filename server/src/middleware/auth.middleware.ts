import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin, supabaseAnon } from '../lib/supabase.js'
import { AppError } from './error-handler.js'
import { setSessionCookies, clearSessionCookies } from '../lib/cookies.js'
import { logger } from '../lib/logger.js'

declare module 'hono' {
  interface ContextVariableMap {
    user: User
    requestId: string
  }
}

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const accessToken = getCookie(c, 'sb-access-token')

  if (accessToken) {
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken)
    if (!error && data.user) {
      c.set('user', data.user)
      await next()
      return
    }
  }

  // Access token missing/expired — attempt a silent refresh before giving
  // up. This is what keeps someone logged in past the ~1hr access token
  // lifetime without re-entering their password every time.
  const refreshToken = getCookie(c, 'sb-refresh-token')
  if (!refreshToken) {
    throw new AppError(401, 'Not authenticated', 'UNAUTHENTICATED')
  }

  const { data: refreshData, error: refreshError } = await supabaseAnon.auth.refreshSession({
    refresh_token: refreshToken,
  })

  if (refreshError || !refreshData.session || !refreshData.user) {
    // Refresh token itself is invalid/expired/already-used — this is a
    // real logout condition, not a retry-able error. Clear cookies so the
    // client isn't left holding dead tokens.
    logger.warn({ err: refreshError?.message }, 'Refresh token invalid or expired')
    clearSessionCookies(c)
    throw new AppError(401, 'Session expired, please sign in again', 'SESSION_EXPIRED')
  }

  // Supabase refresh tokens are single-use and rotate on every refresh —
  // the old one is now dead, so we must persist the new pair immediately.
  setSessionCookies(
    c,
    refreshData.session.access_token,
    refreshData.session.refresh_token,
    refreshData.session.expires_in,
  )
  c.set('user', refreshData.user)
  await next()
}