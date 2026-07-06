import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function AuthCard({
  title,
  children,
  footer,
}: {
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-5">
        <div className="flex justify-end">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-white/40 hover:text-white/80 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <h1 className="text-xl font-medium text-center">{title}</h1>

        <div className="flex flex-col gap-3">{children}</div>

        {footer && (
          <div className="text-center text-sm text-white/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}