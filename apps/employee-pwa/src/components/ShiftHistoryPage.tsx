import { useState, useEffect } from 'react'
import api from '../services/api'

interface Props { onBack: () => void }

function fmt(dt: string) {
  return new Date(dt).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' })
}
function fmtDur(mins: number | null) {
  if (!mins) return '—'
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}ש' ${m}ד'` : `${m}ד'`
}

const locIcon: Record<string, string> = { BRANCH: '🏢', HOME: '🏠', FIELD: '🚗', UNKNOWN: '❓' }
const locLabel: Record<string, string> = { BRANCH: 'סניף', HOME: 'בית', FIELD: 'שטח', UNKNOWN: 'לא ידוע' }
const statusLabel: Record<string, string> = { ACTIVE: 'פעיל', CLOSED: 'סגור', CLOSED_MANUAL: 'סגור ידנית', FLAGGED_UNCLOSED: 'לא נסגר' }

export default function ShiftHistoryPage({ onBack }: Props) {
  const [shifts, setShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [monthHours, setMonthHours] = useState(0)
  const [monthShifts, setMonthShifts] = useState(0)

  useEffect(() => {
    api.get('/shifts/my-history?limit=90').then(r => {
      const data = r.data.data
      setShifts(data)
      // This month stats
      const now = new Date()
      const thisMonth = data.filter((s: any) => {
        const d = new Date(s.startedAt)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && s.endedAt
      })
      setMonthShifts(thisMonth.length)
      setMonthHours(+(thisMonth.reduce((a: number, s: any) => a + (s.durationMinutes || 0), 0) / 60).toFixed(1))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>→ חזרה</button>
        <span style={styles.title}>היסטוריית משמרות</span>
        <span />
      </div>

      {/* Monthly summary */}
      <div style={styles.monthCard}>
        <div style={styles.monthLabel}>החודש הנוכחי</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#E31837' }}>{monthHours}ש'</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>שעות</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,.3)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{monthShifts}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>משמרות</div>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#999', padding: 32 }}>טוען...</p>
        ) : shifts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: 32 }}>אין משמרות עדיין</p>
        ) : (
          <div>
            {shifts.map((s: any) => (
              <div key={s.shiftId} style={styles.shiftCard}>
                <div style={styles.shiftTop}>
                  <span style={styles.date}>{fmt(s.startedAt)}</span>
                  <span style={{ ...styles.badge, background: s.status === 'ACTIVE' ? '#e8f5e9' : s.status === 'FLAGGED_UNCLOSED' ? '#ffebee' : '#f5f5f5', color: s.status === 'ACTIVE' ? '#2e7d32' : s.status === 'FLAGGED_UNCLOSED' ? '#c62828' : '#555' }}>
                    {statusLabel[s.status] || s.status}
                  </span>
                </div>
                <div style={styles.shiftRow}>
                  <div>
                    <div style={styles.label}>כניסה</div>
                    <div style={styles.value}>{fmt(s.startedAt)}</div>
                    <div style={styles.sub}>{locIcon[s.startLocationType]} {locLabel[s.startLocationType]}</div>
                  </div>
                  {s.endedAt && (
                    <>
                      <div style={styles.arrow}>→</div>
                      <div>
                        <div style={styles.label}>יציאה</div>
                        <div style={styles.value}>{fmt(s.endedAt)}</div>
                        <div style={styles.sub}>{locIcon[s.endLocationType]} {locLabel[s.endLocationType]}</div>
                      </div>
                    </>
                  )}
                  <div style={{ flex: 1 }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={styles.label}>משך</div>
                    <div style={{ ...styles.value, color: '#E31837', fontWeight: 700 }}>{fmtDur(s.durationMinutes)}</div>
                  </div>
                </div>
                {s.startBranch && <div style={styles.branchTag}>🏢 {s.startBranch}</div>}
                {s.isManualOverride && <div style={styles.manualTag}>✏️ תוקן ידנית על ידי מנהל</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' },
  header: { background: '#E31837', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { background: 'none', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', padding: '4px 8px' },
  title: { fontWeight: 700, fontSize: 17 },
  monthCard: { background: 'linear-gradient(135deg,#c62828,#E31837)', padding: '20px 24px', textAlign: 'center' },
  monthLabel: { color: 'rgba(255,255,255,.8)', fontSize: 13, marginBottom: 4 },
  content: { flex: 1, padding: 16 },
  shiftCard: { background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)' },
  shiftTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  date: { fontSize: 13, color: '#888' },
  badge: { fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 12 },
  shiftRow: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  arrow: { color: '#ccc', fontSize: 18, marginTop: 14 },
  label: { fontSize: 11, color: '#999', marginBottom: 2 },
  value: { fontSize: 15, fontWeight: 600 },
  sub: { fontSize: 12, color: '#888', marginTop: 2 },
  branchTag: { marginTop: 10, fontSize: 12, color: '#666', borderTop: '1px solid #f0f0f0', paddingTop: 8 },
  manualTag: { fontSize: 11, color: '#e65100', marginTop: 4 },
}
