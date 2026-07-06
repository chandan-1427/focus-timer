import { useCallback, useEffect, useState } from 'react'
import { authApi, ApiError } from '@/lib/api'
import { type User } from '@/types/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    authApi
      .me()
      .then((data: any) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false))
  }, [])

  const signup = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const data: any = await authApi.signup(email, password)
      setUser(data.user)
      return true
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unable to sign up')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const signin = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const data: any = await authApi.signin(email, password)
      setUser(data.user)
      return true
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unable to sign in')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {})
    setUser(null)
  }, [])

  return { user, checkingSession, loading, error, signup, signin, logout }
}