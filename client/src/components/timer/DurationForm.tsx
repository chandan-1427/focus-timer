import { Clock } from 'lucide-react'
import { UnitSelect } from './UnitSelect'
import { useDurationForm } from '@/hooks/useDurationForm'
import { Button } from '@/components/ui/Button'

export function DurationForm({
  currentMinutes,
  onApply,
}: {
  currentMinutes: number
  onApply: (minutes: number) => void
}) {
  const { inputValue, setInputValue, unit, setUnit, isValidInput, handleApplyCustom } =
    useDurationForm(currentMinutes, onApply)

  return (
    <>
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
        <UnitSelect unit={unit} setUnit={setUnit} />
      </div>

      <Button onClick={handleApplyCustom} disabled={!isValidInput}>
        Set duration
      </Button>

      {!isValidInput && inputValue.trim() !== '' && (
        <p className="text-xs text-red-400/80 -mt-1">Enter a duration greater than 0</p>
      )}
    </>
  )
}