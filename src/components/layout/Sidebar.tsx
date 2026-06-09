import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { X, Menu } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { THEMES, type ThemeId } from '@/lib/themes'

const NAV_ITEMS = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/journal', label: '手帐', icon: '📒' },
  { to: '/watchlist', label: '想看清单', icon: '📌' },
  { to: '/shelf', label: '观影架', icon: '📚' },
  { to: '/shelf/books', label: '书架', icon: '📖' },
  { to: '/checklist', label: '观影清单', icon: '📋' },
  { to: '/import', label: '媒体搜索', icon: '🔍' },
  { to: '/quotations', label: '摘录', icon: '💬' },
  { to: '/archive', label: '档案馆', icon: '📦' },
  { to: '/reviews', label: '影评', icon: '📝' },
  { to: '/report', label: '阅读报告', icon: '📊' },
  { to: '/settings', label: '设置', icon: '⚙' },
]

interface SidebarProps { isOpen: boolean; onToggle: () => void; onClose: () => void }

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { theme, setTheme } = useThemeStore()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="sidebar-toggle"
        style={{
          display: 'none',
          position: 'fixed', top: 10, left: 10, zIndex: 101,
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--nav-bg)', border: '1px solid var(--border)',
          color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer',
          backdropFilter: 'blur(8px)', alignItems: 'center', justifyContent: 'center',
        }}>
        <Menu size={18} />
      </button>

      {/* Mobile backdrop */}
      <div
        className="sidebar-backdrop"
        style={{
          display: 'none', position: 'fixed', inset: 0, zIndex: 99,
          background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)',
          transition: 'opacity 0.3s ease', opacity: 0, pointerEvents: 'none',
        }}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className="side-nav"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100, width: 200,
          background: 'var(--nav-bg)', backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1px solid var(--border)',
          transition: 'all 0.6s ease',
          display: 'flex', flexDirection: 'column', overflowY: 'auto',
        }}>
        {/* Mobile close button */}
        <button
          className="sidebar-close-btn"
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'none', position: 'absolute', top: 6, right: 8, zIndex: 102,
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.08)', color: 'var(--text)',
            fontSize: '1.3rem', cursor: 'pointer',
          }}>
          <X size={20} />
        </button>

        <div className="nav-inner" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 12px 8px', gap: 8 }}>
          {/* Logo */}
          <div className="nav-logo" style={{
            fontSize: '1.25rem', fontWeight: 700,
            background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            cursor: 'pointer', letterSpacing: 2, whiteSpace: 'nowrap',
            textAlign: 'center', padding: '8px 0', marginBottom: 6,
          }}>
            🌳 树洞
          </div>

          {/* Nav links */}
          <div className="nav-links" style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            {NAV_ITEMS.map(({ to, label, icon }) => {
              const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="nav-link"
                  style={{
                    padding: active ? '10px 14px 10px 11px' : '10px 14px',
                    borderRadius: active ? '0 10px 10px 0' : 10,
                    fontSize: '0.82rem', cursor: 'pointer', background: active ? 'var(--tag-bg)' : 'transparent',
                    border: 'none', color: active ? 'var(--accent)' : 'var(--text-muted)',
                    fontFamily: 'inherit', transition: 'all 0.28s cubic-bezier(0.22,1,0.36,1)',
                    whiteSpace: 'nowrap', textAlign: 'left' as any, display: 'flex',
                    alignItems: 'center', gap: 8, position: 'relative' as any,
                    fontWeight: active ? 500 : 400,
                    boxShadow: active ? 'inset 3px 0 0 var(--accent)' : 'none',
                    textDecoration: 'none',
                  }}>
                  <span>{icon}</span> {label}
                </NavLink>
              )
            })}
          </div>

          {/* Theme switcher */}
          <div className="theme-switcher" style={{
            display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap',
            justifyContent: 'center', padding: '12px 4px 8px',
            borderTop: '1px solid var(--border)', marginTop: 'auto',
          }}>
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="theme-dot"
                style={{
                  width: 18, height: 18, borderRadius: '50%', cursor: 'pointer',
                  border: `2px solid ${theme === t.id ? 'var(--text)' : 'transparent'}`,
                  transition: 'all 0.3s ease',
                  boxShadow: theme === t.id ? '0 0 8px var(--glow)' : 'none',
                  background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`,
                }}
                title={t.name}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Responsive styles — exact original media queries */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-toggle { display: flex !important; }
          .sidebar-close-btn { display: flex !important; }
          .sidebar-backdrop { display: block !important; }
          .side-nav {
            width: 100% !important; height: auto !important; bottom: auto !important;
            position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important;
            border-right: none !important; border-bottom: 1px solid var(--border) !important;
            max-height: 65vh !important; overflow-y: auto !important;
            transform: translateY(-100%) !important; transition: transform 0.3s ease !important;
            z-index: 100 !important;
          }
          .side-nav.open { transform: translateY(0) !important; }
          .sidebar-backdrop.show { opacity: 1 !important; pointer-events: all !important; }
          .nav-inner { padding: 20px 0 12px !important; }
          .nav-links { padding: 0 8px !important; }
        }
      `}</style>

      {/* Toggle mobile state via CSS class injection */}
      {mobileOpen && (
        <>
          <style>{`
            .side-nav { transform: translateY(0) !important; }
            .sidebar-backdrop { opacity: 1 !important; pointer-events: all !important; }
            .sidebar-toggle { display: none !important; }
          `}</style>
        </>
      )}
    </>
  )
}
