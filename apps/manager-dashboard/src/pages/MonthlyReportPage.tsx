import { useState, useEffect } from 'react'
import api from '../services/api'

export default function MonthlyReportPage() {
  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [branches, setBranches] = useState<any[]>([])
  const [branchId, setBranchId] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/branches').then(r => setBranches(r.data.data)).catch(() => {})
  }, [])

  const load = async () => {
    setLoading(true)
    const [year, month] = monthYear.split('-')
    try {
      const res = await api.get(`/dashboard/monthly?year=${year}&month=${month}${branchId ? `&branchId=${branchId}` : ''}`)
      setData(res.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [monthYear, branchId])

  const downloadExcel = () => {
    const [year, month] = monthYear.split('-')
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const from = `${year}-${month}-01`
    const to = `${year}-${month}-${lastDay}`
    const token = localStorage.getItem('mgr_token')
    const params = new URLSearchParams({ from, to, ...(branchId ? { branchId } : {}) })
    fetch(`/api/v1/reports/shifts/excel?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob()).then(blob => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `shifttrack-${monthYear}.xlsx`
        a.click()
      })
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>📅 דוח חודשי</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>חודש</label>
            <input type="month" value={monthYear} onChange={e => setMonthYear(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600 }}>סניף</label>
            <select value={branchId} onChange={e => setBranchId(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, minWidth: 180 }}>
              <option value="">כל הסניפים</option>
              {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={downloadExcel}>📥 Excel</button>
        </div>
      </div>

      {loading && <p style={{ color: '#666', padding: 16 }}>טוען...</p>}

      {data && !loading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#E31837' }}>{data.totalShifts}</div>
              <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>משמרות</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1565c0' }}>{data.totalHours}ש'</div>
              <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>שעות סה"כ</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#2e7d32' }}>{data.employees.length}</div>
              <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>עובדים</div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>פירוט לפי עובד</h2>
            <div className="table-scroll"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  {['#', 'עובד', 'טלפון', 'משמרות', 'שעות סה"כ', '🏢 סניף', '🏠 בית', '🚗 שדה', '❓ לא ידוע'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'right', color: '#666', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.employees.map((e: any, i: number) => (
                  <tr key={e.employee.id} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '9px 10px', color: '#999' }}>{i + 1}</td>
                    <td style={{ padding: '9px 10px', fontWeight: 600 }}>{e.employee.fullName}</td>
                    <td style={{ padding: '9px 10px', direction: 'ltr', color: '#555' }}>{e.employee.phone}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center' }}>{e.shiftCount}</td>
                    <td style={{ padding: '9px 10px', fontWeight: 700, color: '#1565c0' }}>
                      {e.totalHours}ש'
                      {e.totalHours > 200 && <span title="מעל 200 שעות בחודש" style={{ marginRight: 4, fontSize: 12 }}>⚠️</span>}
                    </td>
                    <td style={{ padding: '9px 10px', color: '#555' }}>{e.hoursByType.branch > 0 ? e.hoursByType.branch + 'ש\'' : '—'}</td>
                    <td style={{ padding: '9px 10px', color: '#555' }}>{e.hoursByType.home > 0 ? e.hoursByType.home + 'ש\'' : '—'}</td>
                    <td style={{ padding: '9px 10px', color: '#555' }}>{e.hoursByType.field > 0 ? e.hoursByType.field + 'ש\'' : '—'}</td>
                    <td style={{ padding: '9px 10px', color: '#999' }}>{e.hoursByType.unknown > 0 ? e.hoursByType.unknown + 'ש\'' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        </>
      )}
    </div>
  )
}
