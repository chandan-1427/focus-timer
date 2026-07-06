import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { AuthCard } from '@/components/auth/AuthCard'
import { EmailInput } from '@/components/auth/EmailInput'
import { Button } from '@/components/ui/Button'

export default function SignInPage() {
  const { signin, loading, error } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await signin(email, password)
    if (ok) navigate('/')
  }

  return (
    <AuthCard
      title="Welcome back"
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-white hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <EmailInput 
          value={email}
          onChange={setEmail}
        />

        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Password"
          autoComplete="current-password"
        />

        {error && <p className="text-xs text-red-400/80">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
        
      </form>
    </AuthCard>
  )
}