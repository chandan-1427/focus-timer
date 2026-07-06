import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { env } from './config/env.js'
import { requestLogger } from './middleware/request-logger.js'
import { errorHandler } from './middleware/error-handler.js'
import { authRoutes } from './routes/auth.routes.js'

export const app = new Hono()

app.onError(errorHandler)
app.use('*', requestLogger)
app.use('*', secureHeaders())
app.use(
  '*',
  cors({
    // Explicit origin list, never '*' — required for credentialed
    // (cookie-based) requests, and Hono's CORS middleware enforces this.
    origin: env.CORS_ORIGINS,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
)

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/auth', authRoutes)

app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404))