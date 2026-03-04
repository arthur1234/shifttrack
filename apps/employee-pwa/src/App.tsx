import { useState } from 'react'
import LoginPage from './components/LoginPage'
import ClockInPage from './components/ClockInPage'
import ShiftHistoryPage from './components/ShiftHistoryPage'

type Page = 'clock' | 'history'

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'))
  const [page, setPage] = useState<Page>('clock')

  const handleLogin = (accessToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    setToken(accessToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    setToken(null)
    setPage('clock')
  }

  if (!token) return <LoginPage onLogin={handleLogin} />

  if (page === 'history') return <ShiftHistoryPage onBack={() => setPage('clock')} />

  return <ClockInPage onLogout={handleLogout} onHistory={() => setPage('history')} />
}
