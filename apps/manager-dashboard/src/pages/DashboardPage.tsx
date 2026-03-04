import { useState, useEffect } from 'react'
import api from '../services/api'

function fmt(dt: string) {
  return new Date(dt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' })
}
function fmtDur(mins: number) {
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}ש ${m}ד` : `${m}ד`
}

export default function DashboardPage() {
  const [active, setActive] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [a, s] = await Promise.all([
        api.get('/dashboard/active'),
        api.get('/dashboard/summary'),
      ])
      setActive(a.data.data)
      setSummary(s.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>לוח בקרה</h1>

      {/* Summary cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#E31837' }}>{summary.activeCount}</div>
            <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>עובדים בשמרה כעת</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#2e7d32' }}>{summary.completedToday}</div>
            <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>משמרות הושלמו היום</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#1565c0' }}>{summary.totalEmployees}</div>
            <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>עובדים פעילים</div>
          </div>
        </div>
      )}

      {/* Active shifts table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>🟢 עובדים במשמרת כעת</h2>
          <button className="btn btn-secondary btn-sm" onClick={load}>רענן</button>
        </div>

        {loading ? (
          <p style={{ color: '#666', padding: 16, textAlign: 'center' }}>טוען...</p>
        ) : active.length === 0 ? (
          <p style={{ color: '#666', padding: 16, textAlign: 'center' }}>אין עובדים במשמרת כעת</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                {['עובד', 'סניף', 'התחלה', 'משך', 'סטטוס'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'right', color: '#666', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.map((s: any) => (
                <tr key={s.shiftId} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{s.employee.fullName}</td>
                  <td style={{ padding: '10px 12px', color: '#555' }}>{s.branch?.name ?? '—'}</td>
                  <td style={{ padding: '10px 12px', color: '#555' }}>{fmt(s.startedAt)}</td>
                  <td style={{ padding: '10px 12px' }}>{fmtDur(s.durationMinutes)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="badge badge-green">פעיל</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
