import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { timers } from '../db/schema.js'
import { createTimerSchema, validateTargetDate } from '../schemas/timer.schema.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { AppError } from '../middleware/error-handler.js'
import { logger } from '../lib/logger.js'

export const timerRoutes = new Hono()

timerRoutes.use('*', requireAuth)

/**
 * GET /timer — returns the signed-in user's timer, or null if none exists.
 * Not a 404 for "no timer" — an empty state is a normal, expected result
 * here, not an error condition.
 */
timerRoutes.get('/', async (c) => {
  const user = c.get('user')

  const [timer] = await db.select().from(timers).where(eq(timers.userId, user.id)).limit(1)

  return c.json({ timer: timer ?? null }, 200)
})

/**
 * POST /timer — creates a new timer. Fails with 409 if one already exists,
 * forcing the client to explicitly choose PUT (replace) rather than us
 * silently overwriting an existing timer on a duplicate POST.
 */
timerRoutes.post('/', async (c) => {
  const user = c.get('user')
  const body = createTimerSchema.parse(await c.req.json())
  const targetDate = new Date(body.targetDate)

  const validationError = validateTargetDate(targetDate)
  if (validationError) {
    throw new AppError(400, validationError, 'INVALID_TARGET_DATE')
  }

  const [existing] = await db.select().from(timers).where(eq(timers.userId, user.id)).limit(1)
  if (existing) {
    throw new AppError(409, 'A timer already exists for this account', 'TIMER_ALREADY_EXISTS')
  }

  const [created] = await db
    .insert(timers)
    .values({ userId: user.id, targetDate })
    .returning()

  if (!created) {
    logger.error({ userId: user.id }, 'Insert returned no row')
    throw new AppError(500, 'Failed to create timer', 'TIMER_CREATE_FAILED')
  }

  logger.info({ userId: user.id, timerId: created.id }, 'Timer created')
  return c.json({ timer: created }, 201)
})

/**
 * PUT /timer — replaces the existing timer's target date. Used both for
 * a plain "edit" action and for the guest-timer migration flow on signup.
 * Upserts (creates if none exists) so the migration flow doesn't need to
 * know in advance whether the user already has a DB timer.
 */
timerRoutes.put('/', async (c) => {
  const user = c.get('user')
  const body = createTimerSchema.parse(await c.req.json())
  const targetDate = new Date(body.targetDate)

  const validationError = validateTargetDate(targetDate)
  if (validationError) {
    throw new AppError(400, validationError, 'INVALID_TARGET_DATE')
  }

  const [existing] = await db.select().from(timers).where(eq(timers.userId, user.id)).limit(1)

  const [result] = existing
    ? await db
        .update(timers)
        .set({ targetDate })
        .where(eq(timers.userId, user.id))
        .returning()
    : await db
        .insert(timers)
        .values({ userId: user.id, targetDate })
        .returning()

  if (!result) {
    logger.error({ userId: user.id }, 'Upsert returned no row')
    throw new AppError(500, 'Failed to save timer', 'TIMER_SAVE_FAILED')
  }

  logger.info({ userId: user.id, timerId: result.id }, 'Timer upserted')
  return c.json({ timer: result }, 200)
})

/**
 * DELETE /timer — cancel/reset. Idempotent: deleting a nonexistent timer
 * is not an error, the end state (no timer) is what the caller wanted.
 */
timerRoutes.delete('/', async (c) => {
  const user = c.get('user')

  await db.delete(timers).where(eq(timers.userId, user.id))

  logger.info({ userId: user.id }, 'Timer deleted')
  return c.json({ message: 'Timer deleted' }, 200)
})