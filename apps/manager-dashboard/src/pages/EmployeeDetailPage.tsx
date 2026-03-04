import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

function fmt(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' })
}
function fmtDur(mins: number | null) {
  if (!mins) return '—'
  const h = Math.floor(mins / 60), m = mins % 60
  return `${h}ש' ${m}ד'`
}

const locationIcon: Record<string, string> = { BRANCH: '🏢', HOME: '🏠', FIELD: '🚗', UNKNOWN: '❓' }
const statusLabel: Record<string, [string, string]> = {
  ACTIVE: ['פעיל', 'badge-green'], CLOSED: ['סגור', 'badge-gray'],
  CLOSED_MANUAL: ['סגור ידנית', 'badge-orange'], FLAGGED_UNCLOSED: ['לא נסגר', 'badge-red'],
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState<any>(null)
  const [shifts, setShifts] = useState<any[]>([])
  const [monthly, setMonthly] = useState<any>(null)
  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [editingShift, setEditingShift] = useState<string | null>(null)
  const [editData, setEditData] = useState({ startedAt: '', endedAt: '', reason: '' })
  const [msg, setMsg] = useState('')

  const loadEmployee = async () => {
    try {
      const [e, s] = await Promise.all([api.get(`/employees/${id}`), api.get(`/employees/${id}/shifts`)])
      setEmployee(e.data.data)
      setShifts(s.data.data)
    } catch {}
  }

  const loadMonthly = async () => {
    const [year, month] = monthYear.split('-')
    try {
      const res = await api.get(`/dashboard/monthly?year=${year}&month=${month}`)
      const emp = res.data.data.employees.find((e: any) => e.employee.id === id)
      setMonthly(emp ?? null)
    } catch {}
  }

  useEffect(() => { loadEmployee() }, [id])
  useEffect(() => { loadMonthly() }, [monthYear, id])

  const handleEdit = async (shiftId: string) => {
    if (!editData.reason) { setMsg('חובה להזין סיבה'); return }
    try {
      await api.put(`/shifts/${shiftId}`, {
        ...(editData.startedAt ? { startedAt: new Date(editData.startedAt).toISOString() } : {}),
        ...(editData.endedAt ? { endedAt: new Date(editData.endedAt).toISOString() } : {}),
        reason: editData.reason,
      })
      setMsg('✅ משמרת עודכנה')
      setEditingShift(null)
      setEditData({ startedAt: '', endedAt: '', reason: '' })
      loadEmployee()
    } catch (e: any) {
      setMsg('❌ ' + (e.response?.data?.error?.message || 'שגיאה'))
    }
  }

  if (!employee) return <div style={{ padding: 32, color: '#666' }}>טוען...</div>

  return (
    <div>
      <button onClick={() => navigate('/employees')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: 16, fontSize: 14 }}>
        ← חזרה לרשימה
      </button>

      {/* Employee header */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{employee.fullName}</h1>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: '#555', fontSize: 14 }}>
              <span>📞 <span dir="ltr">{employee.phone}</span></span>
              {employee.email && <span>✉️ {employee.email}</span>}
              <span>🏢 {employee.homeBranch?.name ?? '—'}</span>
              {employee.position && <span>💼 {employee.position}</span>}
              <span>📋 {({'ADMIN':'מנהל כללי','BRANCH_MANAGER':'מנהל סניף','ACCOUNTING':'הנה"ח','EMPLOYEE':'עובד'} as Record<string,string>)[employee.role] ?? employee.role}</span>
              <span>{employee.employeeType === 'FIELD_WORKER' ? '🚗 שדה' : '👤 רגיל'}</span>
              {employee.hireDate && <span>📅 מ-{new Date(employee.hireDate).toLocaleDateString('he-IL')}</span>}
            </div>
          </div>
          <span className={`badge ${employee.isActive ? 'badge-green' : 'badge-gray'}`}>
            {employee.isActive ? 'פעיל' : 'לא פעיל'}
          </span>
        </div>
      </div>

      {/* Monthly summary */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>📊 סיכום חודשי</h2>
          <input type="month" value={monthYear} onChange={e => setMonthYear(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
        </div>
        {monthly ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { label: 'סה"כ שעות', val: monthly.totalHours + 'ש\'', color: '#1565c0' },
              { label: 'משמרות', val: monthly.shiftCount, color: '#333' },
              { label: '🏢 בסניף', val: monthly.hoursByType.branch + 'ש\'', color: '#E31837' },
              { label: '🏠 מהבית', val: monthly.hoursByType.home + 'ש\'', color: '#2e7d32' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ textAlign: 'center', padding: '12px', background: '#f9f9f9', borderRadius: 10 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color }}>{val}</div>
                <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#999', fontSize: 14 }}>אין נתונים לחודש זה</p>
        )}
      </div>

      {/* Shift history */}
      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🕐 היסטוריית משמרות</h2>
        {msg && <div style={{ padding: '8px 14px', borderRadius: 8, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2e7d32' : '#c62828', marginBottom: 12, fontSize: 13 }}>{msg}</div>}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              {['כניסה', 'יציאה', 'משך', 'סניף', 'מיקום', 'סטטוס', 'עריכה'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'right', color: '#666', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shifts.map((s: any) => {
              const [label, cls] = statusLabel[s.status] ?? [s.status, 'badge-gray']
              return (
                <>
                  <tr key={s.shiftId} style={{ borderBottom: editingShift === s.shiftId ? 'none' : '1px solid #f5f5f5' }}>
                    <td style={{ padding: '9px 10px' }}>{fmt(s.startedAt)}</td>
                    <td style={{ padding: '9px 10px', color: '#555' }}>{fmt(s.endedAt)}</td>
                    <td style={{ padding: '9px 10px' }}>{fmtDur(s.durationMinutes)}</td>
                    <td style={{ padding: '9px 10px', color: '#555' }}>{s.startBranch ?? '—'}</td>
                    <td style={{ padding: '9px 10px' }}>{locationIcon[s.startLocationType] ?? '?'}</td>
                    <td style={{ padding: '9px 10px' }}>
                      <span className={`badge ${cls}`}>{label}</span>
                      {s.isManualOverride && <span style={{ marginRight: 4, fontSize: 11, color: '#e65100' }}>✏️</span>}
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => { setEditingShift(s.shiftId); setEditData({ startedAt: '', endedAt: '', reason: '' }) }}>
                        ✏️
                      </button>
                    </td>
                  </tr>
                  {editingShift === s.shiftId && (
                    <tr key={`edit-${s.shiftId}`} style={{ borderBottom: '1px solid #f5f5f5', background: '#fffde7' }}>
                      <td colSpan={7} style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>כניסה חדשה</label>
                            <input type="datetime-local" value={editData.startedAt}
                              onChange={e => setEditData(p => ({ ...p, startedAt: e.target.value }))}
                              style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>יציאה חדשה</label>
                            <input type="datetime-local" value={editData.endedAt}
                              onChange={e => setEditData(p => ({ ...p, endedAt: e.target.value }))}
                              style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>סיבה *</label>
                            <input type="text" placeholder="חובה" value={editData.reason}
                              onChange={e => setEditData(p => ({ ...p, reason: e.target.value }))}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 12 }} />
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-primary btn-sm" onClick={() => handleEdit(s.shiftId)}>שמור</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingShift(null)}>ביטול</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
            {shifts.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#999' }}>אין היסטוריית משמרות</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
