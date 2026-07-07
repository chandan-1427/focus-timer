import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core'

/**
 * One row per user, enforced by the UNIQUE constraint on user_id — that's
 * what makes "one active timer per user" a database guarantee rather than
 * something our API has to remember to check. When multiple-timers support
 * is added later, this constraint gets dropped and a `status` column added;
 * nothing else here needs to change.
 *
 * No .references() to auth.users is declared here because Drizzle can't see
 * Supabase's auth schema (it's outside schemaFilter) — the foreign key
 * and cascade behavior are added via raw SQL in the RLS migration below.
 */
export const timers = pgTable('timers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  targetDate: timestamp('target_date', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Timer = typeof timers.$inferSelect
export type NewTimer = typeof timers.$inferInsert