import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cloud, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export function AuthNotice() {
  const { user, checkingSession, logout } = useAuth()
  const [open, setOpen] = useLocalStorage(
    'auth-notice-open',
    true
  )

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
    <div className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-2 px-3.5 py-3 cursor-pointer text-left"
      >
        <Cloud className="w-4 h-4 text-white/40 shrink-0" />
        <span className="text-xs text-white/50 flex-1">Save your countdown to the cloud</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-white/40 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-2 px-3.5 pb-3.5 text-xs">
            <p className="text-white/50 leading-relaxed">
              Sign up to keep your countdown running in the cloud — check it from any device,
              anytime, without losing progress.
            </p>
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
        </div>
      </div>
    </div>
  )
}