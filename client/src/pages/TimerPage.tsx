import { useTimer } from '@/hooks/useTimer'
import { PresetButtons } from '@/components/timer/PresetButtons'
import { DurationForm } from '@/components/timer/DurationForm'
import { TimerDisplay } from '@/components/timer/TimerDisplay'
import { TimerControls } from '@/components/timer/TimerControls'

export default function TimerPage() {
  const { minutes, isRunning, remainingMs, applyMinutes, toggleRunning, reset } = useTimer()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
      <TimerDisplay remainingMs={remainingMs} />

      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <PresetButtons onSelect={applyMinutes} />
        <DurationForm currentMinutes={minutes} onApply={applyMinutes} />
        <p className="text-xs text-white/40">Up to 10 years</p>
      </div>

      <TimerControls
        isRunning={isRunning}
        remainingMs={remainingMs}
        onToggle={toggleRunning}
        onReset={reset}
      />
    </div>
  )
}