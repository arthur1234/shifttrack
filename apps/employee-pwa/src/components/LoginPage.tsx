import { useState } from 'react'
import api from '../services/api'

interface Props { onLogin: (token: string) => void }

export default function LoginPage({ onLogin }: Props) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const requestOtp = async () => {
    setLoading(true); setError('')
    try {
      await api.post('/auth/otp/request', { phone })
      setStep('code')
    } catch (e: any) {
      setError(e.response?.data?.error?.message || 'שגיאה. נסה שוב.')
    } finally { setLoading(false) }
  }

  const verifyOtp = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/otp/verify', { phone, code })
      onLogin(res.data.data.accessToken)
    } catch (e: any) {
      setError(e.response?.data?.error?.message || 'קוד שגוי. נסה שוב.')
    } finally { setLoading(false) }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🍕</div>
        <h1 style={styles.title}>ShiftTrack</h1>
        <p style={styles.subtitle}>מעקב שעות עובדים</p>

        {step === 'phone' ? (
          <>
            <label style={styles.label}>מספר טלפון</label>
            <input
              style={styles.input}
              type="tel"
              placeholder="+972501234567"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              dir="ltr"
            />
            <button style={styles.btn} onClick={requestOtp} disabled={loading || !phone}>
              {loading ? 'שולח...' : 'שלח קוד'}
            </button>
          </>
        ) : (
          <>
            <label style={styles.label}>קוד אימות (SMS)</label>
            <input
              style={styles.input}
              type="number"
              placeholder="123456"
              value={code}
              onChange={e => setCode(e.target.value)}
              dir="ltr"
            />
            <button style={styles.btn} onClick={verifyOtp} disabled={loading || code.length !== 6}>
              {loading ? 'מאמת...' : 'כניסה'}
            </button>
            <button style={styles.btnBack} onClick={() => setStep('phone')}>
              חזרה
            </button>
          </>
        )}

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: 16 },
  card: { background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', textAlign: 'center' },
  logo: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 700, color: '#E31837', marginBottom: 4 },
  subtitle: { color: '#666', marginBottom: 24, fontSize: 14 },
  label: { display: 'block', textAlign: 'right', marginBottom: 6, fontWeight: 600, fontSize: 14 },
  input: { width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #ddd', fontSize: 16, marginBottom: 16, textAlign: 'left', direction: 'ltr' },
  btn: { width: '100%', padding: '14px', borderRadius: 10, background: '#E31837', color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 8 },
  btnBack: { width: '100%', padding: '12px', borderRadius: 10, background: 'transparent', color: '#666', border: '1px solid #ddd', fontSize: 14, cursor: 'pointer' },
  error: { color: '#E31837', marginTop: 12, fontSize: 14 }
}
