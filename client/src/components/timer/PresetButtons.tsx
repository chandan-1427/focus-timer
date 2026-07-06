import { PRESETS } from '@/types/timer'

export function PresetButtons({ onSelect }: { onSelect: (minutes: number) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          onClick={() => onSelect(p.minutes)}
          className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60
                     hover:bg-white/10 hover:text-white transition-colors"
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}