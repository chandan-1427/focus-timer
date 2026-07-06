import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { logger } from '../lib/logger.js'

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = 'INTERNAL_ERROR',
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const errorHandler: ErrorHandler = (err, c) => {
  const requestId = c.get('requestId') as string | undefined

  if (err instanceof ZodError) {
    logger.warn({ requestId, issues: err.issues }, 'Validation failed')
    return c.json(
      {
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: err.issues },
      },
      400,
    )
  }

  if (err instanceof AppError) {
    logger.warn({ requestId, code: err.code }, err.message)
    return c.json({ error: { code: err.code, message: err.message } }, err.statusCode as 400)
  }

  if (err instanceof HTTPException) {
    return c.json({ error: { code: 'HTTP_ERROR', message: err.message } }, err.status)
  }

  // Unexpected error — log full detail server-side, leak nothing to client.
  logger.error({ requestId, err }, 'Unhandled error')
  return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } }, 500)
}