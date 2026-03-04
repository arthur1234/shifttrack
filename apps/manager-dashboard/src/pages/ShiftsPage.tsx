import { useState, useEffect } from 'react'
import api from '../services/api'

function fmt(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' })
}
function fmtDur(mins: number | null) {
  if (!mins) return '—'
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}ש' ${m}ד'` : `${m}ד'`
}

const statusLabels: Record<string, [string, string]> = {
  ACTIVE: ['פעיל', 'badge-green'],
  CLOSED: ['סגור', 'badge-gray'],
  CLOSED_MANUAL: ['סגור ידני', 'badge-orange'],
  FLAGGED_UNCLOSED: ['לא סגור', 'badge-red'],
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/shifts').then(r => {
      setShifts(r.data.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>🕐 היסטוריית משמרות</h1>
      <div className="card">
        {loading ? <p style={{ padding: 16, textAlign: 'center', color: '#666' }}>טוען...</p> : (
          <div className="table-scroll"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                {['עובד', 'סניף', 'התחלה', 'סיום', 'משך', 'סטטוס', 'הערות'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'right', color: '#666', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map((s: any) => {
                const [label, cls] = statusLabels[s.status] ?? [s.status, 'badge-gray']
                return (
                  <tr key={s.shiftId} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '9px 10px', fontWeight: 600 }}>{s.employee.fullName}</td>
                    <td style={{ padding: '9px 10px', color: '#555' }}>{s.startBranch ?? '—'}</td>
                    <td style={{ padding: '9px 10px', color: '#555' }}>{fmt(s.startedAt)}</td>
                    <td style={{ padding: '9px 10px', color: '#555' }}>{fmt(s.endedAt)}</td>
                    <td style={{ padding: '9px 10px' }}>{fmtDur(s.durationMinutes)}</td>
                    <td style={{ padding: '9px 10px' }}><span className={`badge ${cls}`}>{label}</span></td>
                    <td style={{ padding: '9px 10px', color: '#999', fontSize: 12 }}>
                      {s.isManualOverride && '✏️ ידני'}
                      {s.startLocationType === 'UNKNOWN' && ' 📍?'}
                    </td>
                  </tr>
                )
              })}
              {shifts.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#666' }}>אין משמרות עדיין</td></tr>
              )}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}
