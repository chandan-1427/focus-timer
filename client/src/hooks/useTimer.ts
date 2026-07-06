import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { DEFAULT_STATE, MAX_MINUTES, type TimerState } from '@/types/timer'

export function useTimer() {
  const [state, setState] = useLocalStorage<TimerState>('timer:state', DEFAULT_STATE)

  const initialRemaining = state.isRunning && state.endTime
    ? Math.max(0, state.endTime - Date.now())
    : (state.pausedRemainingMs ?? state.minutes * 60_000)

  const [remainingMs, setRemainingMs] = useState(initialRemaining)
  const rafRef = useRef<number | null>(null)

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
    setRemainingMs(clamped * 60_000)
    setState({
      minutes: clamped,
      isRunning: false,
      endTime: null,
      pausedRemainingMs: clamped * 60_000,
    })
  }

  function toggleRunning() {
    if (state.isRunning) {
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

  return { minutes: state.minutes, isRunning: state.isRunning, remainingMs, applyMinutes, toggleRunning, reset }
}