import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: '📊 לוח בקרה', exact: true },
  { to: '/employees', label: '👥 עובדים' },
  { to: '/branches', label: '🏢 סניפים' },
  { to: '/shifts', label: '🕐 משמרות' },
  { to: '/monthly', label: '📅 חודשי' },
  { to: '/reports', label: '📋 דוחות' },
]

export default function Layout({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="layout-root">
      {/* Mobile overlay */}
      {menuOpen && (
        <div className="sidebar-overlay" onClick={closeMenu} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          🍕 ShiftTrack
          <button className="sidebar-close-btn" onClick={closeMenu}>✕</button>
        </div>
        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="logout-btn" onClick={onLogout}>יציאה</button>
      </aside>

      {/* Main content */}
      <div className="layout-main">
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button className="hamburger-btn" onClick={() => setMenuOpen(true)}>☰</button>
          <span className="mobile-logo">🍕 ShiftTrack</span>
        </div>

        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}
