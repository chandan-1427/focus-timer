import { useState } from 'react'

export function PasswordInput({
  value,
  onChange,
  placeholder = 'Password',
  autoComplete = 'current-password',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className="flex items-center w-full rounded-xl border border-white/10 bg-white/5
                 focus-within:border-white/30 focus-within:bg-white/[0.08] transition-colors"
    >
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm outline-none"
      />

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="shrink-0 px-4 py-2.5 text-sm text-white/40 hover:text-white/80 transition-colors cursor-pointer"
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}