import pino, { type LoggerOptions } from 'pino'
import { env, isProd } from '../config/env.js'

/**
 * Structured logger. In prod this emits JSON (for log aggregators like
 * Datadog/CloudWatch); in dev it pretty-prints. Never log passwords, tokens,
 * or full cookie headers — redact them at the source, not as an afterthought.
 */
const options: LoggerOptions = {
  level: isProd ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'password',
      'access_token',
      'refresh_token',
    ],
    censor: '[REDACTED]',
  },
  base: { env: env.NODE_ENV },
}

// Only attach `transport` in dev — omitting the key entirely (rather than
// setting it to undefined) is what exactOptionalPropertyTypes requires.
if (!isProd) {
  options.transport = {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
  }
}

export const logger = pino(options)