import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { signupSchema, signinSchema } from '../schemas/auth.schema.js'
import { supabaseAnon, supabaseAdmin } from '../lib/supabase.js'
import { setSessionCookies, clearSessionCookies } from '../lib/cookies.js'
import { AppError } from '../middleware/error-handler.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { signupRateLimiter, signinRateLimiter } from '../middleware/rate-limit.js'
import { logger } from '../lib/logger.js'

export const authRoutes = new Hono()

/**
 * POST /auth/signup
 * Creates the user in Supabase Auth. If email confirmation is enabled on
 * the project, no session is returned yet — we tell the client that
 * explicitly instead of silently doing nothing.
 */
authRoutes.post('/signup', signupRateLimiter, async (c) => {
  const body = signupSchema.parse(await c.req.json())

  // Admin API creates the user directly via the service role — this path
  // never invokes GoTrue's mailer, so it's immune to the email rate limit
  // that a public signUp() call is subject to even with confirmation off.
  const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true, // mark as confirmed immediately, no verification flow
  })

  if (createError) {
    logger.warn({ code: createError.code, status: createError.status }, 'Signup failed')
    throw new AppError(createError.status ?? 400, createError.message, 'SIGNUP_FAILED')
  }

  if (!createData.user) {
    logger.error('Admin createUser succeeded but returned no user')
    throw new AppError(500, 'Signup succeeded but user could not be created', 'SIGNUP_NO_USER')
  }

  // createUser() doesn't return a session, so sign in immediately after
  // to issue real tokens for the cookies — same anon client used elsewhere.
  const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  })

  if (signInError || !signInData.session) {
    logger.error({ userId: createData.user.id, err: signInError?.message }, 'Post-signup signin failed')
    throw new AppError(500, 'Signup succeeded but session could not be created', 'SIGNUP_NO_SESSION')
  }

  setSessionCookies(
    c,
    signInData.session.access_token,
    signInData.session.refresh_token,
    signInData.session.expires_in,
  )
  logger.info({ userId: createData.user.id }, 'User signed up')

  return c.json({ user: { id: createData.user.id, email: createData.user.email } }, 201)
})

/**
 * POST /auth/signin
 */
authRoutes.post('/signin', signinRateLimiter, async (c) => {
  const body = signinSchema.parse(await c.req.json())

  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  })

  if (error) {
    // Deliberately generic message — don't tell an attacker whether the
    // email exists or the password was wrong.
    logger.warn({ email: body.email, code: error.code }, 'Signin failed')
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS')
  }

  setSessionCookies(c, data.session.access_token, data.session.refresh_token, data.session.expires_in)
  logger.info({ userId: data.user.id }, 'User signed in')

  return c.json({ user: { id: data.user.id, email: data.user.email } }, 200)
})

/**
 * POST /auth/logout
 * Requires a valid session — you can't invalidate a session you can't prove
 * ownership of. Revokes the refresh token server-side (real logout, not
 * just "the browser forgot the cookie") and clears both cookies regardless
 * of the Supabase call's outcome, so the client is never left half-logged-in.
 */
authRoutes.post('/logout', requireAuth, async (c) => {
  const refreshToken = getCookie(c, 'sb-refresh-token')
  const user = c.get('user')

  if (refreshToken) {
    // Set the session on this client instance so signOut() knows which
    // refresh token to revoke, then revoke it.
    await supabaseAnon.auth.setSession({
      access_token: getCookie(c, 'sb-access-token') ?? '',
      refresh_token: refreshToken,
    })
    const { error } = await supabaseAnon.auth.signOut()
    if (error) {
      logger.warn({ userId: user.id, err: error.message }, 'Supabase signOut returned an error')
    }
  }

  clearSessionCookies(c)

  logger.info({ userId: user.id }, 'User logged out')
  return c.json({ message: 'Logged out successfully' }, 200)
})

/**
 * GET /auth/me — small but essential: lets the frontend check session
 * state on load without guessing from cookie presence alone.
 */
authRoutes.get('/me', requireAuth, (c) => {
  const user = c.get('user')
  return c.json({ user: { id: user.id, email: user.email } }, 200)
})