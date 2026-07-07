import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../config/env.js'
import * as schema from './schema.js'

/**
 * Single shared connection pool for the app's lifetime. postgres.js
 * manages pooling internally — we don't open/close a connection per
 * request, that would exhaust Supabase's connection limit fast.
 */
const queryClient = postgres(env.DATABASE_URL, { max: 10 })

export const db = drizzle(queryClient, { schema })