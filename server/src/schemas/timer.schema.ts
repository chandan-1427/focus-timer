import { z } from 'zod'

const MAX_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000 // approximation is fine here, not billing logic

export const createTimerSchema = z.object({
  targetDate: z.string().datetime({ message: 'targetDate must be a valid ISO 8601 string' }),
})

export function validateTargetDate(targetDate: Date): string | null {
  const now = Date.now()
  const diff = targetDate.getTime() - now

  if (Number.isNaN(targetDate.getTime())) return 'Invalid date.'
  if (diff <= 0) return 'Timer must be set in the future.'
  if (diff > MAX_YEARS_MS) return 'Timer cannot be more than 10 years from now.'
  return null
}