import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import EmployeesPage from './pages/EmployeesPage'
import BranchesPage from './pages/BranchesPage'
import ShiftsPage from './pages/ShiftsPage'
import ReportsPage from './pages/ReportsPage'

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('mgr_token'))

  const handleLogin = (t: string) => {
    localStorage.setItem('mgr_token', t)
    setToken(t)
  }

  const handleLogout = () => {
    localStorage.removeItem('mgr_token')
    setToken(null)
  }

  if (!token) return <LoginPage onLogin={handleLogin} />

  return (
    <Layout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/shifts" element={<ShiftsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}
