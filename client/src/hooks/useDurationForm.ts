import { useState } from 'react'
import { type Unit, UNIT_TO_MINUTES } from '@/types/timer'

export function useDurationForm(initialMinutes: number, onApply: (minutes: number) => void) {
  const [inputValue, setInputValue] = useState(String(initialMinutes))
  const [unit, setUnit] = useState<Unit>('minutes')

  const parsedNum = Number(inputValue)
  const isValidInput = inputValue.trim() !== '' && Number.isFinite(parsedNum) && parsedNum > 0

  function handleApplyCustom() {
    if (!isValidInput) return
    onApply(parsedNum * UNIT_TO_MINUTES[unit])
  }

  return { inputValue, setInputValue, unit, setUnit, isValidInput, handleApplyCustom }
}