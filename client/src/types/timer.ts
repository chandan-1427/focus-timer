export const MAX_MINUTES = 10 * 365 * 24 * 60 // 10 years
export const DEFAULT_MINUTES = 30

export const UNIT_TO_MINUTES = {
  minutes: 1,
  hours: 60,
  days: 1440,
  weeks: 10080,
  months: 43200,
  years: 525600,
} as const

export type Unit = keyof typeof UNIT_TO_MINUTES
export const UNITS = Object.keys(UNIT_TO_MINUTES) as Unit[]

export const PRESETS: { label: string; minutes: number }[] = [
  { label: '5m', minutes: 5 },
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '1d', minutes: 1440 },
]

export type TimerState = {
  minutes: number
  isRunning: boolean
  endTime: number | null
  pausedRemainingMs: number | null
}

export const DEFAULT_STATE: TimerState = {
  minutes: DEFAULT_MINUTES,
  isRunning: false,
  endTime: null,
  pausedRemainingMs: DEFAULT_MINUTES * 60_000,
}