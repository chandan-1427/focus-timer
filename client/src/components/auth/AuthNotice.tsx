import { Link } from 'react-router-dom'
import { Cloud, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function AuthNotice() {
  const { user, checkingSession, logout } = useAuth()

  if (checkingSession) return null

  if (user) {
    return (
      <div className="flex items-center justify-between gap-3 w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">
        <span className="text-xs text-white/50 truncate">{user.email}</span>
        <button
          onClick={logout}
          className="flex items-center gap-1 text-xs text-white/40 hover:text-white/80 transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log out
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-3.5 py-3">
      <div className="flex items-start gap-2">
        <Cloud className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
        <p className="text-xs text-white/50 leading-relaxed">
          Sign up to keep your countdown running in the cloud — check it from any device, anytime, without losing progress.
        </p>
      </div>
      <div className="flex gap-2 text-xs">
        <Link
          to="/auth/signup"
          className="flex-1 text-center rounded-lg bg-white text-black font-medium py-1.5 hover:opacity-80 transition"
        >
          Sign up
        </Link>
        <Link
          to="/auth/signin"
          className="flex-1 text-center rounded-lg border border-white/10 py-1.5 text-white/70 hover:text-white transition"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}