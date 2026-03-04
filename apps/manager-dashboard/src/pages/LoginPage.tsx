import { useState } from 'react'
import api from '../services/api'

export default function LoginPage({ onLogin }: { onLogin: (t: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      onLogin(res.data.data.accessToken)
    } catch (e: any) {
      setError(e.response?.data?.error?.message || 'שגיאה. בדוק אימייל וסיסמה.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f9' }}>
      <div className="card" style={{ width: 360, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🍕</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#E31837' }}>ShiftTrack</h1>
          <p style={{ color: '#666', fontSize: 13, marginTop: 4 }}>פורטל מנהלים</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: 13 }}>אימייל</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, direction: 'ltr' }}
              required
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, fontSize: 13 }}>סיסמה</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, direction: 'ltr' }}
              required
            />
          </div>
          {error && <p style={{ color: '#c62828', marginBottom: 12, fontSize: 13 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 12, fontSize: 15 }} disabled={loading}>
            {loading ? 'מתחבר...' : 'כניסה'}
          </button>
        </form>
      </div>
    </div>
  )
}
