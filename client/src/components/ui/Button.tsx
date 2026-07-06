// components/ui/Button.tsx
import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  shape?: 'rounded' | 'pill'
  fullWidth?: boolean
}

export function Button({
  children,
  shape = 'rounded',
  fullWidth = true,
  className = '',
  ...props
}: ButtonProps) {
  const shapeClasses = shape === 'pill' ? 'rounded-full w-28 py-2' : 'rounded-xl py-2.5'

  return (
    <button
      className={`
        ${fullWidth && shape === 'rounded' ? 'w-full' : ''}
        ${shapeClasses}
        bg-white text-black text-sm font-medium text-center
        hover:opacity-80 active:scale-[0.98] transition cursor-pointer
        disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </button>
  )
}