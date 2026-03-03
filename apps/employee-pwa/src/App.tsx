import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import ClockInPage from './components/ClockInPage'

export default function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  )

  const handleLogin = (accessToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    setToken(accessToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    setToken(null)
  }

  if (!token) return <LoginPage onLogin={handleLogin} />
  return <ClockInPage onLogout={handleLogout} />
}
