import { useState, useEffect } from 'react'
import api from '../services/api'

function fmt(dt: string) {
  return new Date(dt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' })
}
function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Jerusalem' })
}
function fmtDur(mins: number) {
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}ש' ${m}ד'` : `${m}ד'`
}

const locationIcon: Record<string, string> = {
  BRANCH: '🏢', HOME: '🏠', FIELD: '🚗', UNKNOWN: '❓'
}

export default function DashboardPage() {
  const [status, setStatus] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [tab, setTab] = useState<'working' | 'notStarted' | 'unclosed'>('working')
  const [loading, setLoading] = useState(true)
  const [closingShift, setClosingShift] = useState<string | null>(null)
  const [closeData, setCloseData] = useState({ endTime: '', reason: '' })
  const [msg, setMsg] = useState('')

  const load = async () => {
    try {
      const [s, sum] = await Promise.all([
        api.get('/dashboard/status'),
        api.get('/dashboard/summary'),
      ])
      setStatus(s.data.data)
      setSummary(sum.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [])

  const handleClose = async (shiftId: string) => {
    if (!closeData.endTime || !closeData.reason) { setMsg('מלא שעת סיום וסיבה'); return }
    try {
      await api.post(`/shifts/${shiftId}/close`, {
        endTime: new Date(closeData.endTime).toISOString(),
        reason: closeData.reason
      })
      setMsg('✅ משמרת נסגרה בהצלחה')
      setClosingShift(null)
      setCloseData({ endTime: '', reason: '' })
      load()
    } catch (e: any) {
      setMsg('❌ ' + (e.response?.data?.error?.message || 'שגיאה'))
    }
  }

  if (loading) return <div style={{ padding: 32, color: '#666' }}>טוען...</div>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>לוח בקרה</h1>
        <button className="btn btn-secondary btn-sm" onClick={load}>🔄 רענן</button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { val: summary.activeCount, label: 'עובדים עכשיו', color: '#E31837' },
            { val: summary.completedToday, label: 'סיימו היום', color: '#2e7d32' },
            { val: summary.totalHoursToday + 'ש\'', label: 'שעות היום', color: '#1565c0' },
            { val: summary.totalEmployees, label: 'עובדים פעילים', color: '#555' },
          ].map(({ val, label, color }) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color }}>{val}</div>
              <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid #eee' }}>
        {[
          { key: 'working', label: `🟢 בשמרה (${status?.working?.length ?? 0})` },
          { key: 'notStarted', label: `⚪ לא התחילו (${status?.notStarted?.length ?? 0})` },
          { key: 'unclosed', label: `🔴 לא נסגרו (${status?.unclosed?.length ?? 0})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{ padding: '8px 16px', border: 'none', background: 'none', fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? '#E31837' : '#555', borderBottom: tab === t.key ? '2px solid #E31837' : '2px solid transparent',
              marginBottom: -2, cursor: 'pointer', fontSize: 14 }}>
            {t.label}
          </button>
        ))}
      </div>

      {msg && <div style={{ padding: '10px 16px', borderRadius: 8, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2e7d32' : '#c62828', marginBottom: 12, fontSize: 14 }}>{msg}</div>}

      {/* Working now */}
      {tab === 'working' && (
        <div className="card">
          {status?.working?.length === 0 ? (
            <p style={{ padding: 16, textAlign: 'center', color: '#666' }}>אין עובדים במשמרת כעת</p>
          ) : (
            <div className="table-scroll"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ borderBottom: '1px solid #eee' }}>
                {['עובד', 'סניף', 'מיקום', 'שעת כניסה', 'משך', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'right', color: '#666', fontWeight: 600 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {status?.working?.map((s: any) => (
                  <tr key={s.shiftId} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{s.employee.fullName}</td>
                    <td style={{ padding: '10px 12px', color: '#555' }}>{s.branch?.name ?? '—'}</td>
                    <td style={{ padding: '10px 12px' }}>{locationIcon[s.locationType] ?? '—'} {s.locationType}</td>
                    <td style={{ padding: '10px 12px', color: '#555' }}>{fmt(s.startedAt)}</td>
                    <td style={{ padding: '10px 12px' }}>{fmtDur(s.durationMinutes)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {s.isUnclosedFlag && <span className="badge badge-red" style={{ fontSize: 11 }}>⚠️ ארוך</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      )}

      {/* Not started */}
      {tab === 'notStarted' && (
        <div className="card">
          {status?.notStarted?.length === 0 ? (
            <p style={{ padding: 16, textAlign: 'center', color: '#666' }}>כולם כבר עבדו היום 🎉</p>
          ) : (
            <div className="table-scroll"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ borderBottom: '1px solid #eee' }}>
                {['עובד', 'טלפון', 'סניף בית', 'סוג'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'right', color: '#666', fontWeight: 600 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {status?.notStarted?.map((e: any) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{e.fullName}</td>
                    <td style={{ padding: '10px 12px', direction: 'ltr', color: '#555' }}>{e.phone}</td>
                    <td style={{ padding: '10px 12px', color: '#555' }}>{e.homeBranch?.name ?? '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge ${e.employeeType === 'FIELD_WORKER' ? 'badge-orange' : 'badge-gray'}`}>
                        {e.employeeType === 'FIELD_WORKER' ? '🚗 שדה' : '👤 רגיל'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      )}

      {/* Unclosed shifts */}
      {tab === 'unclosed' && (
        <div className="card">
          {status?.unclosed?.length === 0 ? (
            <p style={{ padding: 16, textAlign: 'center', color: '#666' }}>אין משמרות פתוחות ישנות ✅</p>
          ) : (
            <>
              <p style={{ color: '#c62828', marginBottom: 12, fontSize: 13 }}>⚠️ משמרות אלה פתוחות מעל 12 שעות ודורשות סגירה ידנית</p>
              <div className="table-scroll"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead><tr style={{ borderBottom: '1px solid #eee' }}>
                  {['עובד', 'סניף', 'נפתח', 'זמן פתוח', 'פעולה'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'right', color: '#666', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {status?.unclosed?.map((s: any) => (
                    <>
                      <tr key={s.shiftId} style={{ borderBottom: closingShift === s.shiftId ? 'none' : '1px solid #f5f5f5' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{s.employee.fullName}</td>
                        <td style={{ padding: '10px 12px', color: '#555' }}>{s.branch?.name ?? '—'}</td>
                        <td style={{ padding: '10px 12px', color: '#555' }}>{fmtDate(s.startedAt)} {fmt(s.startedAt)}</td>
                        <td style={{ padding: '10px 12px' }}><span className="badge badge-red">{s.hoursOpen}ש'</span></td>
                        <td style={{ padding: '10px 12px' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => setClosingShift(s.shiftId)}>סגור ידנית</button>
                        </td>
                      </tr>
                      {closingShift === s.shiftId && (
                        <tr key={`close-${s.shiftId}`} style={{ borderBottom: '1px solid #f5f5f5', background: '#fff8f8' }}>
                          <td colSpan={5} style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                              <div>
                                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>שעת סיום</label>
                                <input type="datetime-local" value={closeData.endTime}
                                  onChange={e => setCloseData(p => ({ ...p, endTime: e.target.value }))}
                                  style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>סיבה</label>
                                <input type="text" placeholder="לדוגמה: עובד שכח לסגור" value={closeData.reason}
                                  onChange={e => setCloseData(p => ({ ...p, reason: e.target.value }))}
                                  style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }} />
                              </div>
                              <div style={{ display: 'flex', gap: 6, marginTop: 18 }}>
                                <button className="btn btn-primary btn-sm" onClick={() => handleClose(s.shiftId)}>אשר</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setClosingShift(null)}>ביטול</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table></div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
