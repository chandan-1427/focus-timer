import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'

/**
 * Anon client — used for user-facing auth flows (signup/signin). Respects
 * RLS. Safe in the sense that it holds no elevated privilege, but we still
 * only ever use it server-side here so we control cookie handling.
 */
export const supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

/**
 * Service-role client — bypasses RLS entirely. Only for trusted server-side
 * admin operations (e.g. verifying a token's user without a full session).
 * NEVER send this key to a client, NEVER import this file in frontend code.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})