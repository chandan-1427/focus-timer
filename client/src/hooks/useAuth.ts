import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, ApiError, type AuthResponse } from '@/lib/api'

const AUTH_QUERY_KEY = ['auth', 'me']

export function useAuth() {
  const queryClient = useQueryClient()

  const { data, isLoading: checkingSession } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () =>
      authApi.me().catch((e) => {
        if (e instanceof ApiError && e.status === 401) return { user: null }
        throw e
      }),
    staleTime: 5 * 60 * 1000, // treat session as fresh for 5 min, avoids refetch spam
  })

  const signupMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signup(email, password),
    onSuccess: (data) => queryClient.setQueryData(AUTH_QUERY_KEY, data),
  })

  const signinMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signin(email, password),
    onSuccess: (data) => queryClient.setQueryData(AUTH_QUERY_KEY, data),
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => queryClient.setQueryData(AUTH_QUERY_KEY, { user: null }),
  })

  const signup = async (email: string, password: string) => {
    try {
      await signupMutation.mutateAsync({ email, password })
      return true
    } catch {
      return false
    }
  }

  const signin = async (email: string, password: string) => {
    try {
      await signinMutation.mutateAsync({ email, password })
      return true
    } catch {
      return false
    }
  }

  const logout = () => logoutMutation.mutateAsync().catch(() => {})

  const activeError = signupMutation.error ?? signinMutation.error
  const errorMessage = activeError instanceof ApiError ? activeError.message : null

  return {
    user: (data as AuthResponse | undefined)?.user ?? null,
    checkingSession,
    loading: signupMutation.isPending || signinMutation.isPending,
    error: errorMessage,
    signup,
    signin,
    logout,
  }
}