export function EmailInput({
  value,
  onChange,
  placeholder = 'Email',
  autoComplete = 'email',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required
      className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm outline-none
                 focus:border-white/30 focus:bg-white/[0.08] transition-colors"
    />
  )
}