import { Routes, Route } from 'react-router-dom'
import TimerPage from '@/pages/TimerPage'
import SignInPage from '@/pages/SignInPage'
import SignUpPage from '@/pages/SignUpPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TimerPage />} />
      <Route path="/auth/signin" element={<SignInPage />} />
      <Route path="/auth/signup" element={<SignUpPage />} />
    </Routes>
  )
}