export function TimerControls({
  isRunning,
  remainingMs,
  onToggle,
  onReset,
}: {
  isRunning: boolean
  remainingMs: number
  onToggle: () => void
  onReset: () => void
}) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onToggle}
        className="w-28 py-2 rounded-full bg-white text-black font-medium text-center
                   hover:opacity-80 active:scale-[0.98] transition cursor-pointer"
      >
        {isRunning ? 'Pause' : remainingMs === 0 ? 'Restart' : 'Start'}
      </button>
      <button
        onClick={onReset}
        className="w-28 py-2 rounded-full bg-white/5 border border-white/10 text-center
                   hover:opacity-80 active:scale-[0.98] transition cursor-pointer"
      >
        Reset
      </button>
    </div>
  )
}