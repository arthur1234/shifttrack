import { useState, useEffect, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
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

// Get base URL for PWA (same origin, root)
const getPwaUrl = (branch: any) => {
  const base = window.location.origin
  return `${base}/?branch=${encodeURIComponent(branch.shortCode || branch.id)}`
}

function QRModal({ branch, onClose }: { branch: any; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const url = getPwaUrl(branch)

  const handleDownload = () => {
    // Find the canvas rendered by QRCodeCanvas
    const canvas = document.getElementById('branch-qr-canvas') as HTMLCanvasElement
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-${branch.shortCode || branch.id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handlePrint = () => {
    const canvas = document.getElementById('branch-qr-canvas') as HTMLCanvasElement
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`
      <html><head><title>QR — ${branch.name}</title>
      <style>
        body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: Arial, sans-serif; direction: rtl; }
        img { width: 300px; height: 300px; }
        h2 { font-size: 24px; margin: 16px 0 4px; }
        p { color: #555; font-size: 16px; margin: 0; }
        .brand { color: #E31837; font-weight: bold; font-size: 20px; margin-bottom: 12px; }
        @media print { button { display: none; } }
      </style></head>
      <body>
        <div class="brand">🍕 Pizza Hut Israel — ShiftTrack</div>
        <img src="${dataUrl}" alt="QR Code" />
        <h2>${branch.name}</h2>
        <p>${branch.city}${branch.address ? ' — ' + branch.address : ''}</p>
        <p style="margin-top:8px;font-size:13px;color:#999">סרוק להתחברות למשמרת</p>
        <button onclick="window.print()" style="margin-top:20px;padding:10px 24px;background:#E31837;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer;">🖨️ הדפס</button>
      </body></html>
    `)
    w.document.close()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32, maxWidth: 380, width: '90%',
        textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>📱 QR — {branch.name}</h2>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>{branch.city}{branch.address ? ` — ${branch.address}` : ''}</p>

        <div style={{ display: 'inline-block', padding: 12, background: '#fff', border: '3px solid #E31837', borderRadius: 12 }}>
          <QRCodeCanvas
            id="branch-qr-canvas"
            value={url}
            size={220}
            level="M"
            imageSettings={{
              src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHRleHQgeT0iMzYiIGZvbnQtc2l6ZT0iMzYiPvCfjaU8L3RleHQ+PC9zdmc+',
              height: 32,
              width: 32,
              excavate: true,
            }}
          />
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: '#999', wordBreak: 'break-all', direction: 'ltr' }}>{url}</p>
        <p style={{ fontSize: 13, color: '#555', marginTop: 8 }}>עובדים סורקים QR בסניף להתחברות מהירה</p>

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={handleDownload}>⬇️ הורד PNG</button>
          <button className="btn btn-primary" onClick={handlePrint}>🖨️ הדפס</button>
          <button className="btn btn-secondary" onClick={onClose}>✕ סגור</button>
        </div>
      </div>
    </div>
  )
}

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
  const [qrBranch, setQrBranch] = useState<any>(null)

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
      {qrBranch && <QRModal branch={qrBranch} onClose={() => setQrBranch(null)} />}

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
          <div className="table-scroll"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                {['שם סניף', 'עיר', 'כתובת', 'קוד', 'עובדים', 'גיאופנס', 'סטטוס', 'פעולות'].map(h => (
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
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => editingBranch?.id === b.id ? setEditingBranch(null) : openEdit(b)}>
                          {editingBranch?.id === b.id ? '✕' : '✏️'}
                        </button>
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => setQrBranch(b)}
                          title="הצג QR Code">
                          📱 QR
                        </button>
                      </div>
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
          </table></div>
        )}
      </div>
    </div>
  )
}
