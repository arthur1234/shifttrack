import { useState, useEffect } from 'react'
import api from '../services/api'

const FIELD_DEFS = [
  { label: 'שם סניף *', key: 'name', required: true, placeholder: 'פיצה האט תל אביב' },
  { label: 'קוד קצר *', key: 'shortCode', required: true, placeholder: 'tlv-center', dir: 'ltr' },
  { label: 'כתובת *', key: 'address', required: true, placeholder: 'דיזנגוף 50' },
  { label: 'עיר *', key: 'city', required: true, placeholder: 'תל אביב' },
  { label: 'קו רוחב (Latitude) *', key: 'latitude', required: true, placeholder: '32.0853', dir: 'ltr' },
  { label: 'קו אורך (Longitude) *', key: 'longitude', required: true, placeholder: '34.7818', dir: 'ltr' },
  { label: 'רדיוס גיאופנס (מטר)', key: 'geofenceRadius', required: false, placeholder: '150', dir: 'ltr' },
]

const EMPTY = { name: '', shortCode: '', address: '', city: '', latitude: '', longitude: '', geofenceRadius: '150', isActive: true }

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>(EMPTY)
  const [editingBranch, setEditingBranch] = useState<any>(null)
  const [editForm, setEditForm] = useState<any>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [search, setSearch] = useState('')

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
      setForm(EMPTY)
      load()
    } catch (e: any) {
      setMsg('❌ ' + (e.response?.data?.error?.message || 'שגיאה'))
    } finally { setSaving(false) }
  }

  const openEdit = (b: any) => {
    setEditingBranch(b)
    setEditForm({
      name: b.name, shortCode: b.shortCode || '', address: b.address || '',
      city: b.city || '', latitude: String(b.latitude || ''), longitude: String(b.longitude || ''),
      geofenceRadius: String(b.geofenceRadius || 150), isActive: b.isActive,
    })
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg('')
    try {
      await api.put(`/branches/${editingBranch.id}`, {
        ...editForm,
        latitude: parseFloat(editForm.latitude),
        longitude: parseFloat(editForm.longitude),
        geofenceRadius: parseInt(editForm.geofenceRadius),
      })
      setMsg('✅ סניף עודכן בהצלחה')
      setEditingBranch(null)
      load()
    } catch (e: any) {
      setMsg('❌ ' + (e.response?.data?.error?.message || 'שגיאה'))
    } finally { setSaving(false) }
  }

  const filtered = branches.filter(b =>
    !search || b.name?.includes(search) || b.city?.includes(search) || b.shortCode?.includes(search)
  )

  const BranchForm = ({ formData, setFormData, onSubmit, submitLabel, onCancel }: any) => (
    <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {FIELD_DEFS.map((f: any) => (
        <div key={f.key}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>{f.label}</label>
          <input required={f.required} value={formData[f.key] ?? ''}
            placeholder={f.placeholder}
            onChange={e => setFormData((p: any) => ({ ...p, [f.key]: e.target.value }))}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, direction: f.dir || 'rtl' }} />
        </div>
      ))}
      <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
          <input type="checkbox" checked={formData.isActive ?? true}
            onChange={e => setFormData((p: any) => ({ ...p, isActive: e.target.checked }))} />
          סניף פעיל
        </label>
        <div style={{ flex: 1 }} />
        <button type="button" className="btn btn-secondary" onClick={onCancel}>ביטול</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'שומר...' : submitLabel}</button>
      </div>
    </form>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>🏢 סניפים ({branches.length})</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setMsg('') }}>
          {showForm ? '✕ בטל' : '+ סניף חדש'}
        </button>
      </div>

      {msg && (
        <div style={{ padding: '10px 16px', borderRadius: 8, background: msg.startsWith('✅') ? '#e8f5e9' : '#ffebee', color: msg.startsWith('✅') ? '#2e7d32' : '#c62828', marginBottom: 16 }}>
          {msg}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>הוספת סניף חדש</h3>
          <BranchForm formData={form} setFormData={setForm} onSubmit={handleCreate} submitLabel="הוסף סניף" onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 חפש לפי שם, עיר או קוד..."
            style={{ width: '100%', padding: '9px 14px', borderRadius: 10, border: '1px solid #ddd', fontSize: 14 }} />
        </div>

        {loading ? (
          <p style={{ padding: 16, textAlign: 'center', color: '#666' }}>טוען...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                {['שם סניף', 'עיר', 'כתובת', 'קוד', 'עובדים', 'גיאופנס', 'סטטוס', 'עריכה'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'right', color: '#666', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b: any) => (
                <>
                  <tr key={b.id} style={{ borderBottom: editingBranch?.id === b.id ? 'none' : '1px solid #f5f5f5' }}>
                    <td style={{ padding: '10px 10px', fontWeight: 600 }}>{b.name}</td>
                    <td style={{ padding: '10px 10px', color: '#555' }}>{b.city}</td>
                    <td style={{ padding: '10px 10px', color: '#888', fontSize: 13 }}>{b.address}</td>
                    <td style={{ padding: '10px 10px', color: '#555', direction: 'ltr', fontSize: 12 }}>{b.shortCode}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'center' }}>{b._count?.employees ?? 0}</td>
                    <td style={{ padding: '10px 10px', color: '#555' }}>{b.geofenceRadius}מ'</td>
                    <td style={{ padding: '10px 10px' }}>
                      <span className={`badge ${b.isActive ? 'badge-green' : 'badge-gray'}`}>
                        {b.isActive ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => editingBranch?.id === b.id ? setEditingBranch(null) : openEdit(b)}>
                        {editingBranch?.id === b.id ? '✕' : '✏️ ערוך'}
                      </button>
                    </td>
                  </tr>
                  {editingBranch?.id === b.id && (
                    <tr key={`edit-${b.id}`} style={{ borderBottom: '2px solid #E31837' }}>
                      <td colSpan={8} style={{ padding: '16px 14px', background: '#fff8f8' }}>
                        <p style={{ fontWeight: 700, marginBottom: 14, color: '#E31837' }}>✏️ עריכת סניף: {b.name}</p>
                        <BranchForm
                          formData={editForm}
                          setFormData={setEditForm}
                          onSubmit={handleEdit}
                          submitLabel="שמור שינויים"
                          onCancel={() => setEditingBranch(null)}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#999' }}>לא נמצאו סניפים</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
