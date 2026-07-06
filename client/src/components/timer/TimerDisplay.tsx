import { formatDuration } from '@/utils/formatDuration'

export function TimerDisplay({ remainingMs }: { remainingMs: number }) {
  const { main, ms } = formatDuration(remainingMs)
  return (
    <div className="text-5xl font-semibold tabular-nums text-center">
      {main}
      <span className="text-2xl align-baseline">.{ms}</span>
    </div>
  )
}