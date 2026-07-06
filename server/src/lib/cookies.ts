import type { Context } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { isProd } from '../config/env.js'

const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
}

export function setSessionCookies(
  c: Context,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
) {
  setCookie(c, 'sb-access-token', accessToken, { ...SESSION_COOKIE_OPTS, maxAge: expiresIn })
  setCookie(c, 'sb-refresh-token', refreshToken, {
    ...SESSION_COOKIE_OPTS,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export function clearSessionCookies(c: Context) {
  deleteCookie(c, 'sb-access-token', { path: '/' })
  deleteCookie(c, 'sb-refresh-token', { path: '/' })
}