import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: '📊 לוח בקרה', exact: true },
  { to: '/employees', label: '👥 עובדים' },
  { to: '/branches', label: '🏢 סניפים' },
  { to: '/shifts', label: '🕐 משמרות' },
]

export default function Layout({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.logo}>🍕 ShiftTrack</div>
        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button style={S.logoutBtn} onClick={onLogout}>יציאה</button>
      </aside>

      {/* Main */}
      <main style={S.main}>{children}</main>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  sidebar: { width: 220, background: '#1a1a2e', display: 'flex', flexDirection: 'column', padding: '0 0 16px' },
  logo: { color: '#fff', fontWeight: 700, fontSize: 18, padding: '20px 16px 24px', borderBottom: '1px solid rgba(255,255,255,.1)' },
  navLink: { display: 'block', padding: '12px 16px', color: 'rgba(255,255,255,.7)', fontSize: 14, transition: 'all .15s', borderRight: '3px solid transparent' },
  navActive: { color: '#fff', background: 'rgba(227,24,55,.15)', borderRight: '3px solid #E31837' },
  logoutBtn: { margin: '0 12px', padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', border: 'none', fontSize: 13 },
  main: { flex: 1, padding: 24, overflow: 'auto' },
}
