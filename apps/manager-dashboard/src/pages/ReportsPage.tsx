import { useState, useEffect } from 'react'
import api from '../services/api'

export default function ReportsPage() {
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])
  const [branches, setBranches] = useState<any[]>([])
  const [branchId, setBranchId] = useState('')
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/branches').then(r => setBranches(r.data.data)).catch(() => {})
  }, [])

  const loadSummary = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ from, to, ...(branchId ? { branchId } : {}) })
      const res = await api.get(`/reports/shifts/summary?${params}`)
      setSummary(res.data.data)
    } catch (e: any) {
      alert('שגיאה בטעינת נתונים')
    } finally { setLoading(false) }
  }

  const downloadExcel = () => {
    const params = new URLSearchParams({ from, to, ...(branchId ? { branchId } : {}) })
    const token = localStorage.getItem('mgr_token')
    // Create a temporary link to trigger download
    const a = document.createElement('a')
    a.href = `/api/v1/reports/shifts/excel?${params}`
    a.setAttribute('download', `shifttrack-report-${from}-${to}.xlsx`)
    // Add auth header via fetch + blob
    fetch(`/api/v1/reports/shifts/excel?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.blob()).then(blob => {
      const url = URL.createObjectURL(blob)
      a.href = url
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>📊 דוחות</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>בחר תקופה</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>מתאריך</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>עד תאריך</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>סניף</label>
            <select value={branchId} onChange={e => setBranchId(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, minWidth: 200 }}>
              <option value="">כל הסניפים</option>
              {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <button className="btn btn-secondary" onClick={loadSummary} disabled={loading}>
            {loading ? 'טוען...' : '📋 הצג סיכום'}
          </button>
          <button className="btn btn-primary" onClick={downloadExcel}>
            📥 ייצוא Excel
          </button>
        </div>
      </div>

      {summary && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#E31837' }}>{summary.totalShifts}</div>
              <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>משמרות בתקופה</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#1565c0' }}>{summary.totalHours}</div>
              <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>שעות עבודה סה"כ</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#2e7d32' }}>{summary.byEmployee.length}</div>
              <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>עובדים פעילים</div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>פירוט לפי עובד</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  {['עובד', 'טלפון', 'משמרות', 'שעות סה"כ'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'right', color: '#666', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.byEmployee.map((e: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{e.name}</td>
                    <td style={{ padding: '10px 12px', direction: 'ltr', color: '#555' }}>{e.phone}</td>
                    <td style={{ padding: '10px 12px' }}>{e.shiftCount}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1565c0' }}>{e.totalHours}ש'</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
