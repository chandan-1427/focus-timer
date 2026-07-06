const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    })
  } catch {
    throw new ApiError('Network error — check your connection', 0)
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(data?.message ?? 'Something went wrong', res.status)
  }

  return data as T
}

export type AuthResponse = { user: User }
import { type User } from '@/types/auth'

export const authApi = {
  signup: (email: string, password: string) =>
    request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signin: (email: string, password: string) =>
    request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  me: () => request<AuthResponse>('/auth/me', { method: 'GET' }),
}