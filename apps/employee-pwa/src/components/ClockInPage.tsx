import { useState, useEffect } from 'react'
import api from '../services/api'

interface Props { onLogout: () => void; onHistory: () => void }

type LocationType = 'BRANCH' | 'HOME' | 'FIELD' | 'UNKNOWN'

interface Shift {
  shiftId: string
  startedAt: string
  locationType: LocationType
  branchName?: string
}

const locationLabels: Record<LocationType, string> = {
  BRANCH: '🏢 בסניף',
  HOME: '🏠 מהבית',
  FIELD: '🚗 בשטח',
  UNKNOWN: '❓ לא ידוע'
}

export default function ClockInPage({ onLogout, onHistory }: Props) {
  const [activeShift, setActiveShift] = useState<Shift | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    if (!activeShift) return
    const interval = setInterval(() => {
      const start = new Date(activeShift.startedAt).getTime()
      const diff = Math.floor((Date.now() - start) / 1000)
      const h = Math.floor(diff / 3600).toString().padStart(2, '0')
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0')
      const s = (diff % 60).toString().padStart(2, '0')
      setElapsed(`${h}:${m}:${s}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [activeShift])

  const getGps = (): Promise<{ latitude: number; longitude: number; accuracy: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('GPS לא זמין בדפדפן')); return }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        () => reject(new Error('לא ניתן לקבל מיקום. אנא אפשר גישה ל-GPS בהגדרות.')),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  const clockIn = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      let gps = { latitude: 0, longitude: 0, accuracy: 999 }
      try { gps = await getGps() } catch {}

      const res = await api.post('/shifts/clock-in', {
        latitude: gps.latitude,
        longitude: gps.longitude,
        accuracy: gps.accuracy,
        timestamp: new Date().toISOString()
      })
      const data = res.data.data
      setActiveShift(data)
      setSuccess(`✅ משמרת החלה ב-${new Date(data.startedAt).toLocaleTimeString('he-IL')}`)
    } catch (e: any) {
      setError(e.response?.data?.error?.message || 'שגיאה בפתיחת משמרת')
    } finally { setLoading(false) }
  }

  const clockOut = async () => {
    setLoading(true); setError(''); setSuccess('')
    try {
      let gps = { latitude: 0, longitude: 0, accuracy: 999 }
      try { gps = await getGps() } catch {}

      const res = await api.post('/shifts/clock-out', {
        latitude: gps.latitude,
        longitude: gps.longitude,
        accuracy: gps.accuracy,
        timestamp: new Date().toISOString()
      })
      const data = res.data.data
      const mins = data.durationMinutes
      setSuccess(`✅ משמרת הסתיימה — ${Math.floor(mins/60)}ש ${mins%60}ד`)
      setActiveShift(null)
    } catch (e: any) {
      setError(e.response?.data?.error?.message || 'שגיאה בסגירת משמרת')
    } finally { setLoading(false) }
  }

  const [showInstall, setShowInstall] = useState(false)
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={styles.logo}>🍕 ShiftTrack</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isInstalled && <button style={styles.installBtn} onClick={() => setShowInstall(!showInstall)}>📲</button>}
          <button style={styles.installBtn} onClick={onHistory}>📋</button>
          <button style={styles.logoutBtn} onClick={onLogout}>יציאה</button>
        </div>
      </div>

      {showInstall && (
        <div style={styles.installBanner}>
          <strong>📲 הוסף לדף הבית</strong>
          <p style={{ marginTop: 6, fontSize: 13 }}>
            <b>iPhone/Safari:</b> לחץ ▫️ "שתף" → "הוסף למסך הבית"<br />
            <b>Android/Chrome:</b> לחץ ⋮ תפריט → "הוסף למסך הבית"
          </p>
          <button onClick={() => setShowInstall(false)} style={{ marginTop: 8, padding: '4px 12px', borderRadius: 6, border: 'none', background: '#E31837', color: '#fff', cursor: 'pointer', fontSize: 12 }}>סגור</button>
        </div>
      )}

      <div style={styles.content}>
        {activeShift ? (
          <div style={styles.card}>
            <div style={styles.activeIndicator}>● משמרת פעילה</div>
            <div style={styles.timer}>{elapsed || '00:00:00'}</div>
            <div style={styles.location}>{locationLabels[activeShift.locationType]}</div>
            {activeShift.branchName && <div style={styles.branchName}>{activeShift.branchName}</div>}
            <button style={{...styles.btn, background: '#d32f2f'}} onClick={clockOut} disabled={loading}>
              {loading ? 'סוגר...' : '⏹ סיום משמרת'}
            </button>
          </div>
        ) : (
          <div style={styles.card}>
            <div style={styles.readyText}>מוכן להתחיל?</div>
            <button style={styles.btn} onClick={clockIn} disabled={loading}>
              {loading ? 'פותח...' : '▶ התחלת משמרת'}
            </button>
          </div>
        )}

          {success && <div style={styles.success}>{success}</div>}
        {error && <div style={styles.error}>{error}</div>}
      </div>

      {/* Bottom nav */}
      <div style={styles.bottomNav}>
        <button style={styles.navActive}>⏱ משמרת</button>
        <button style={styles.navBtn} onClick={onHistory}>📋 היסטוריה</button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  installBanner: { background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 10, margin: '12px 16px 0', padding: '12px 16px', fontSize: 14, lineHeight: 1.6 },
  installBtn: { background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.4)', color: '#fff', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' },
  header: { background: '#E31837', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontWeight: 700, fontSize: 18 },
  logoutBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  content: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', textAlign: 'center' },
  activeIndicator: { color: '#2e7d32', fontWeight: 700, marginBottom: 12, fontSize: 14 },
  timer: { fontSize: 48, fontWeight: 700, fontFamily: 'monospace', color: '#333', marginBottom: 16, letterSpacing: 2 },
  location: { fontSize: 20, marginBottom: 8 },
  branchName: { color: '#666', fontSize: 14, marginBottom: 20 },
  readyText: { fontSize: 22, fontWeight: 600, color: '#333', marginBottom: 24 },
  btn: { width: '100%', padding: '18px', borderRadius: 14, background: '#E31837', color: '#fff', border: 'none', fontSize: 18, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  success: { marginTop: 16, background: '#e8f5e9', color: '#2e7d32', padding: '12px 20px', borderRadius: 10, fontWeight: 600 },
  error: { marginTop: 16, background: '#ffebee', color: '#c62828', padding: '12px 20px', borderRadius: 10 },
  bottomNav: { display: 'flex', borderTop: '1px solid #eee', background: '#fff' },
  navActive: { flex: 1, padding: '14px', border: 'none', background: '#fff8f8', color: '#E31837', fontWeight: 700, fontSize: 14, cursor: 'pointer', borderTop: '3px solid #E31837' },
  navBtn: { flex: 1, padding: '14px', border: 'none', background: '#fff', color: '#888', fontWeight: 600, fontSize: 14, cursor: 'pointer' },
}
