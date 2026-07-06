import type { MiddlewareHandler } from 'hono'
import { randomUUID } from 'node:crypto'
import { logger } from '../lib/logger.js'

/**
 * Assigns a request ID (for tracing a request across logs) and logs
 * method/path/status/duration on every request. This is the difference
 * between debugging a prod incident in 5 minutes vs. 2 hours.
 */
export const requestLogger: MiddlewareHandler = async (c, next) => {
  const requestId = randomUUID()
  c.set('requestId', requestId)
  c.header('X-Request-Id', requestId)

  const start = Date.now()
  await next()
  const durationMs = Date.now() - start

  logger.info(
    {
      requestId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs,
    },
    'request completed',
  )
}