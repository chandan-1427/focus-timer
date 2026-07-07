import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Only manage our own app tables — never let drizzle-kit touch the
  // auth/storage/realtime schemas Supabase owns and migrates itself.
  schemaFilter: ['public'],
})