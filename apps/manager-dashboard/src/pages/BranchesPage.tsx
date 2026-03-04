import { useState, useEffect } from 'react'
import api from '../services/api'

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', city: '', latitude: '', longitude: '', geofenceRadius: '150', shortCode: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    try {
      const res = await api.get('/branches')
      setBranches(res.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg('')
    try {
      await api.post('/branches', {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        geofenceRadius: parseInt(form.geofenceRadius),
      })
      setMsg('✅ סניף נוסף בהצלחה')
      setShowForm(false)
      setForm({ name: '', address: '', city: '', latitude: '', longitude: '', geofenceRadius: '150', shortCode: '' })
      load()
    } catch (e: any) {
      setMsg('❌ ' + (e.response?.data?.error?.message || 'שגיאה'))
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>🏢 סניפים</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ הוסף סניף</button>
      </div>

      {msg && <div style={{ padding: '10px 16px', borderRadius: 8, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2e7d32' : '#c62828', marginBottom: 16 }}>{msg}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>הוספת סניף חדש</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'שם סניף *', key: 'name', required: true },
              { label: 'קוד קצר *', key: 'shortCode', required: true, placeholder: 'tlv-1' },
              { label: 'כתובת *', key: 'address', required: true },
              { label: 'עיר *', key: 'city', required: true },
              { label: 'קו רוחב (Latitude) *', key: 'latitude', required: true, placeholder: '32.0853', dir: 'ltr' },
              { label: 'קו אורך (Longitude) *', key: 'longitude', required: true, placeholder: '34.7818', dir: 'ltr' },
              { label: 'רדיוס גיאופנס (מטר)', key: 'geofenceRadius', required: false, placeholder: '150', dir: 'ltr' },
            ].map((f: any) => (
              <div key={f.key}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>{f.label}</label>
                <input required={f.required} value={(form as any)[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, direction: f.dir || 'rtl' }} />
              </div>
            ))}
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>ביטול</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'שומר...' : 'הוסף סניף'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? <p style={{ padding: 16, textAlign: 'center', color: '#666' }}>טוען...</p> : branches.length === 0 ? (
          <p style={{ padding: 16, textAlign: 'center', color: '#666' }}>אין סניפים עדיין. הוסף סניף ראשון.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                {['שם', 'עיר', 'קוד', 'עובדים', 'גיאופנס', 'סטטוס'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'right', color: '#666', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {branches.map((b: any) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{b.name}</td>
                  <td style={{ padding: '10px 12px', color: '#555' }}>{b.city}</td>
                  <td style={{ padding: '10px 12px', color: '#555', direction: 'ltr' }}>{b.shortCode}</td>
                  <td style={{ padding: '10px 12px' }}>{b._count?.employees ?? 0}</td>
                  <td style={{ padding: '10px 12px', color: '#555' }}>{b.geofenceRadius}מ</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge ${b.isActive ? 'badge-green' : 'badge-gray'}`}>{b.isActive ? 'פעיל' : 'לא פעיל'}</span>
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
