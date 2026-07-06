import { useEffect, useRef, useState } from 'react'
import { Clock, ChevronDown } from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const MAX_MINUTES = 10 * 365 * 24 * 60 // 10 years
const DEFAULT_MINUTES = 30

const UNIT_TO_MINUTES = {
  minutes: 1,
  hours: 60,
  days: 1440,
  weeks: 10080,
  months: 43200,
  years: 525600,
} as const

type Unit = keyof typeof UNIT_TO_MINUTES

const PRESETS: { label: string; minutes: number }[] = [
  { label: '5m', minutes: 5 },
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '1d', minutes: 1440 },
]

type TimerState = {
  minutes: number
  isRunning: boolean
  endTime: number | null // absolute epoch ms, only meaningful while running
  pausedRemainingMs: number | null // snapshot taken when paused
}

const DEFAULT_STATE: TimerState = {
  minutes: DEFAULT_MINUTES,
  isRunning: false,
  endTime: null,
  pausedRemainingMs: DEFAULT_MINUTES * 60_000,
}

// Returns the main "y d hh:mm:ss" string and the ms string separately
// so they can be styled differently.
function formatDuration(totalMs: number) {
  const pad = (n: number, len = 2) => n.toString().padStart(len, '0')
  const totalSeconds = Math.floor(totalMs / 1000)
  const ms = totalMs % 1000

  const years = Math.floor(totalSeconds / (365 * 24 * 3600))
  let rem = totalSeconds % (365 * 24 * 3600)
  const days = Math.floor(rem / (24 * 3600))
  rem %= 24 * 3600
  const hours = Math.floor(rem / 3600)
  rem %= 3600
  const minutes = Math.floor(rem / 60)
  const seconds = rem % 60

  const parts: string[] = []
  if (years) parts.push(`${years}y`)
  if (years || days) parts.push(`${days}d`)
  parts.push(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`)

  return {
    main: parts.join(' '),
    ms: pad(ms, 3),
  }
}

export default function TimerPage() {
  const [state, setState] = useLocalStorage<TimerState>('timer:state', DEFAULT_STATE)

  // Derive the initial displayed remaining ms synchronously from persisted state,
  // so a reload while running doesn't flash the full duration first.
  const initialRemaining = state.isRunning && state.endTime
    ? Math.max(0, state.endTime - Date.now())
    : (state.pausedRemainingMs ?? state.minutes * 60_000)

  const [remainingMs, setRemainingMs] = useState(initialRemaining)
  const rafRef = useRef<number | null>(null)

  const [inputValue, setInputValue] = useState(String(state.minutes))
  const [unit, setUnit] = useState<Unit>('minutes')

  const parsedNum = Number(inputValue)
  const isValidInput = inputValue.trim() !== '' && Number.isFinite(parsedNum) && parsedNum > 0

  useEffect(() => {
    if (!state.isRunning || !state.endTime) return

    function tick() {
      const left = Math.max(0, state.endTime! - Date.now())
      setRemainingMs(left)
      if (left <= 0) {
        setState((s) => ({ ...s, isRunning: false, endTime: null, pausedRemainingMs: 0 }))
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [state.isRunning, state.endTime, setState])

  function applyMinutes(m: number) {
    const clamped = Math.min(MAX_MINUTES, Math.max(0, m))
    setInputValue(String(clamped))
    setRemainingMs(clamped * 60_000)
    setState({
      minutes: clamped,
      isRunning: false,
      endTime: null,
      pausedRemainingMs: clamped * 60_000,
    })
  }

  function handleApplyCustom() {
    if (!isValidInput) return
    applyMinutes(parsedNum * UNIT_TO_MINUTES[unit])
  }

  function toggleRunning() {
    if (state.isRunning) {
      // pause: snapshot current remaining
      setState((s) => ({ ...s, isRunning: false, endTime: null, pausedRemainingMs: remainingMs }))
    } else {
      const base = remainingMs > 0 ? remainingMs : state.minutes * 60_000
      const endTime = Date.now() + base
      setRemainingMs(base)
      setState((s) => ({ ...s, isRunning: true, endTime, pausedRemainingMs: null }))
    }
  }

  function reset() {
    const full = state.minutes * 60_000
    setRemainingMs(full)
    setState((s) => ({ ...s, isRunning: false, endTime: null, pausedRemainingMs: full }))
  }

  const { main, ms } = formatDuration(remainingMs)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
      <div className="text-5xl font-semibold tabular-nums text-center">
        {main}
        <span className="text-2xl align-baseline">.{ms}</span>
      </div>

      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        {/* Quick presets */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyMinutes(p.minutes)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60
                         hover:bg-white/10 hover:text-white transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom input group — visually one control */}
        <div
          className="flex items-center w-full rounded-xl border border-white/10 bg-white/5
                     focus-within:border-white/30 focus-within:bg-white/[0.08] transition-colors"
        >
          <Clock className="w-4 h-4 ml-3 text-white/30 shrink-0" />
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApplyCustom()
            }}
            placeholder="Duration"
            className="min-w-0 flex-1 bg-transparent px-2.5 py-2.5 text-sm outline-none
                       [appearance:textfield]
                       [&::-webkit-outer-spin-button]:appearance-none
                       [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="relative shrink-0">
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as Unit)}
              className="appearance-none bg-transparent border-l border-white/10 pl-3 pr-7 py-2.5
                         text-sm text-white/70 outline-none cursor-pointer"
            >
              {Object.keys(UNIT_TO_MINUTES).map((u) => (
                <option key={u} value={u} className="text-black">
                  {u}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={handleApplyCustom}
          disabled={!isValidInput}
          className="w-full rounded-xl bg-white text-black text-sm font-medium py-2.5
                     hover:opacity-80 active:scale-[0.98] transition cursor-pointer
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          Set duration
        </button>

        {!isValidInput && inputValue.trim() !== '' && (
          <p className="text-xs text-red-400/80 -mt-1">Enter a duration greater than 0</p>
        )}

        <p className="text-xs text-white/40">Up to 10 years</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={toggleRunning}
          className="px-6 py-2 rounded-full bg-white text-black font-medium
                     hover:opacity-80 active:scale-[0.98] transition cursor-pointer"
        >
          {state.isRunning ? 'Pause' : remainingMs === 0 ? 'Restart' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:opacity-80 active:scale-[0.98] transition cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  )
}