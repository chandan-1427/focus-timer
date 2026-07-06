import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { type Unit, UNITS } from '@/types/timer'

export function UnitSelect({ unit, setUnit }: { unit: Unit; setUnit: (u: Unit) => void }) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(() => UNITS.indexOf(unit))
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    if (open) setHighlighted(UNITS.indexOf(unit))
  }, [open, unit])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        setOpen(true)
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlighted((h) => Math.min(UNITS.length - 1, h + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlighted((h) => Math.max(0, h - 1))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        setUnit(UNITS[highlighted])
        setOpen(false)
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={`flex items-center gap-1.5 border-l border-white/10 pl-3 pr-2.5 py-2.5
                    text-sm outline-none cursor-pointer transition-colors rounded-r-xl
                    ${open ? 'text-white bg-white/[0.06]' : 'text-white/70 hover:text-white hover:bg-white/[0.03]'}`}
      >
        <span className="capitalize">{unit}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/30 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[8.5rem]
                     overflow-hidden rounded-xl border border-white/10 bg-[#161616]
                     p-1 shadow-xl shadow-black/40"
        >
          {UNITS.map((u, i) => (
            <li
              key={u}
              role="option"
              aria-selected={u === unit}
              onMouseEnter={() => setHighlighted(i)}
              onClick={() => {
                setUnit(u)
                setOpen(false)
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm
                          capitalize cursor-pointer select-none transition-colors
                          ${i === highlighted ? 'bg-white/10 text-white' : 'text-white/70'}`}
            >
              {u}
              {u === unit && <Check className="w-3.5 h-3.5" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}