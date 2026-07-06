import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { EmailInput } from '@/components/auth/EmailInput'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { AuthCard } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'

export default function SignUpPage() {
  const { signup, loading, error } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = await signup(email, password)
    if (ok) navigate('/')
  }

  return (
    <AuthCard
      title="Create an account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/auth/signin" className="text-white hover:underline">
            Sign in
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
          autoComplete="new-password"
        />

        {error && <p className="text-xs text-red-400/80">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </Button>
        
      </form>
    </AuthCard>
  )
}