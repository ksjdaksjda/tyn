import { NavLink, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
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

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[200px] z-50 border-r border-[var(--border)]"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'all 0.6s ease',
        }}>
        <SidebarInner theme={theme} setTheme={setTheme} location={location} onClose={onClose} />
      </aside>

      {/* Mobile sidebar */}
      <aside className={cn(
        'lg:hidden fixed top-0 left-0 right-0 z-50 transition-transform duration-300 border-b border-[var(--border)]',
        isOpen ? 'translate-y-0' : '-translate-y-full',
      )}
        style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div className="relative">
          <button onClick={onClose} className="absolute top-1.5 right-2 z-[102] w-[44px] h-[44px] rounded-full border-none bg-black/5 text-[var(--text)] text-xl flex items-center justify-center lg:hidden">
            <X size={20} />
          </button>
          <SidebarInner theme={theme} setTheme={setTheme} location={location} onClose={onClose} />
        </div>
      </aside>

      {/* Mobile backdrop */}
      <div className={cn(
        'lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300',
        isOpen ? 'opacity-100 pointer-events-all' : 'opacity-0 pointer-events-none',
      )} onClick={onClose} />
    </>
  )
}

function SidebarInner({
  theme, setTheme, location, onClose,
}: {
  theme: string; setTheme: (t: ThemeId) => void; location: { pathname: string }; onClose: () => void
}) {
  return (
    <div className="flex flex-col h-full p-4 gap-2">
      {/* Logo */}
      <div className="text-center py-2 mb-2 cursor-pointer">
        <span className="text-xl font-bold tracking-[2px] whitespace-nowrap"
          style={{
            background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          🌳 树洞
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_ITEMS.map(({ to, label, icon }) => {
          const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2 py-2.5 px-3.5 rounded-[10px] text-[0.82rem] whitespace-nowrap transition-all duration-[0.28s] relative',
                active
                  ? 'text-[var(--accent)] font-medium'
                  : 'text-[var(--text-muted)] hover:bg-[var(--tag-bg)] hover:text-[var(--text)] hover:translate-x-0.5',
              )}
              style={active ? {
                background: 'var(--tag-bg)',
                borderRadius: '0 10px 10px 0',
                paddingLeft: '11px',
                boxShadow: 'inset 3px 0 0 var(--accent)',
              } : undefined}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Theme switcher */}
      <div className="flex gap-1 flex-wrap justify-center py-3 px-1 mt-auto border-t border-[var(--border)]">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              'w-[18px] h-[18px] rounded-full border-2 border-transparent transition-all duration-300',
              theme === t.id ? 'border-[var(--text)] shadow-[0_0_8px_var(--glow)] scale-110' : 'hover:scale-120',
            )}
            style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}
            title={t.name}
          />
        ))}
      </div>
    </div>
  )
}
