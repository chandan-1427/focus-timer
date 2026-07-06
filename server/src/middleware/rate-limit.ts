import { rateLimiter } from 'hono-rate-limiter'
import { getConnInfo } from '@hono/node-server/conninfo'

/**
 * IP-based, in-memory rate limiting for the two most abuse-prone endpoints.
 * Signup is capped tighter than signin — a spam signup creates a
 * permanent Supabase Auth user, while a bad signin attempt just fails.
 *
 * NOTE: MemoryStore is per-process. Fine for a single Node instance; if
 * you ever scale to multiple instances/containers behind a load balancer,
 * swap in @hono-rate-limiter's Redis store so limits are shared, or an
 * attacker can just get N free attempts per instance.
 */
const keyGenerator = (c: Parameters<typeof getConnInfo>[0]) =>
  getConnInfo(c).remote.address ?? 'unknown'

export const signupRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: 'draft-7',
  keyGenerator,
})

export const signinRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  keyGenerator,
})