import { serve } from '@hono/node-server'
import { app } from './app.js'
import { env } from './config/env.js'
import { logger } from './lib/logger.js'

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info({ port: info.port, env: env.NODE_ENV }, 'Server started')
})

// Graceful shutdown — in-flight requests finish before the process exits.
// Skipping this is a common cause of dropped requests during deploys.
function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down gracefully')
  server.close((err) => {
    if (err) {
      logger.error({ err }, 'Error during shutdown')
      process.exit(1)
    }
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection')
})