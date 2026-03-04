import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function EmployeesPage() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', role: 'EMPLOYEE', homeBranchId: '' })
  const [branches, setBranches] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    try {
      const [e, b] = await Promise.all([api.get('/employees'), api.get('/branches')])
      setEmployees(e.data.data)
      setBranches(b.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg('')
    try {
      await api.post('/employees', { ...form, homeBranchId: form.homeBranchId || undefined })
      setMsg('✅ עובד נוסף בהצלחה')
      setShowForm(false)
      setForm({ fullName: '', phone: '', email: '', role: 'EMPLOYEE', homeBranchId: '' })
      load()
    } catch (e: any) {
      setMsg('❌ ' + (e.response?.data?.error?.message || 'שגיאה'))
    } finally { setSaving(false) }
  }

  const roleLabel: Record<string, string> = {
    ADMIN: '👑 אדמין', BRANCH_MANAGER: '🏢 מנהל סניף',
    ACCOUNTING: '📊 הנהלת חשבונות', EMPLOYEE: '👤 עובד'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>👥 עובדים</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ הוסף עובד</button>
      </div>

      {msg && <div style={{ padding: '10px 16px', borderRadius: 8, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2e7d32' : '#c62828', marginBottom: 16 }}>{msg}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>הוספת עובד חדש</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'שם מלא *', key: 'fullName', type: 'text', required: true },
              { label: 'טלפון *', key: 'phone', type: 'tel', required: true, dir: 'ltr' },
              { label: 'אימייל', key: 'email', type: 'email', required: false },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>{f.label}</label>
                <input type={f.type} required={f.required} value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, direction: (f as any).dir || 'rtl' }} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>תפקיד</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                {Object.entries(roleLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>סניף בית</label>
              <select value={form.homeBranchId} onChange={e => setForm(p => ({ ...p, homeBranchId: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                <option value="">— ללא סניף —</option>
                {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>ביטול</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'שומר...' : 'הוסף עובד'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? <p style={{ padding: 16, textAlign: 'center', color: '#666' }}>טוען...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                {['שם', 'טלפון', 'תפקיד', 'סניף', 'סטטוס'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'right', color: '#666', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp: any) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                    <button onClick={() => navigate(`/employees/${emp.id}`)}
                      style={{ background: 'none', border: 'none', color: '#E31837', cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: 0 }}>
                      {emp.fullName}
                    </button>
                  </td>
                  <td style={{ padding: '10px 12px', direction: 'ltr', color: '#555' }}>{emp.phone}</td>
                  <td style={{ padding: '10px 12px' }}>{roleLabel[emp.role] || emp.role}</td>
                  <td style={{ padding: '10px 12px', color: '#555' }}>{emp.homeBranch?.name ?? '—'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge ${emp.isActive ? 'badge-green' : 'badge-gray'}`}>
                      {emp.isActive ? 'פעיל' : 'לא פעיל'}
                    </span>
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
