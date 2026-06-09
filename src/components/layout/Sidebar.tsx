import { NavLink, useLocation } from 'react-router-dom'
import { X, Home, BookOpen, Bookmark, Library, ListTodo, Search, MessageSquare, Archive, PenLine, BarChart3, Settings, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/themeStore'
import { THEMES, type ThemeId } from '@/lib/themes'

const NAV_ITEMS = [
  { to: '/', label: '首页', icon: Home },
  { to: '/journal', label: '手帐', icon: PenLine },
  { to: '/watchlist', label: '想看清单', icon: Bookmark },
  { to: '/shelf', label: '观影架', icon: Library },
  { to: '/shelf/books', label: '书架', icon: BookOpen },
  { to: '/checklist', label: '观影清单', icon: ListTodo },
  { to: '/import', label: '媒体搜索', icon: Search },
  { to: '/quotations', label: '摘录', icon: MessageSquare },
  { to: '/archive', label: '档案馆', icon: Archive },
  { to: '/reviews', label: '影评', icon: PenLine },
  { to: '/report', label: '阅读报告', icon: BarChart3 },
  { to: '/settings', label: '设置', icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

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
        }}>
        <SidebarContent theme={theme} setTheme={setTheme} location={location} onClose={onClose} />
      </aside>

      {/* Mobile sidebar */}
      <aside className={cn(
        'lg:hidden fixed top-0 left-0 right-0 z-50 transition-transform duration-300 border-b border-[var(--border)]',
        isOpen ? 'translate-y-0' : '-translate-y-full',
      )}
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
        <SidebarContent theme={theme} setTheme={setTheme} location={location} onClose={onClose} isMobile />
      </aside>
    </>
  )
}

function SidebarContent({
  theme, setTheme, onClose, isMobile,
}: {
  theme: string
  setTheme: (t: ThemeId) => void
  location: { pathname: string }
  onClose: () => void
  isMobile?: boolean
}) {
  return (
    <div className="flex flex-col h-full p-3">
      {/* Logo */}
      <div className="flex items-center justify-between mb-4 px-2 pt-2">
        <span className="text-xl font-bold text-shimmer">🌳 树洞</span>
        {isMobile && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                active
                  ? 'text-[var(--accent)] font-medium'
                  : 'text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--text)]',
              )}
              style={active ? { boxShadow: 'inset 3px 0 0 var(--accent)' } : undefined}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Theme switcher */}
      <div className="pt-3 border-t border-[var(--border)]">
        <div className="flex flex-wrap gap-1.5 justify-center">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                'w-6 h-6 rounded-full transition-all duration-200',
                theme === t.id ? 'ring-2 ring-[var(--text)] scale-110' : 'hover:scale-105',
              )}
              style={{
                background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})`,
              }}
              title={t.name}
            />
          ))}
        </div>
        <p className="text-center text-[10px] text-[var(--text-muted)] mt-1.5">
          {THEMES.find(t => t.id === theme)?.icon} {THEMES.find(t => t.id === theme)?.name}
        </p>
      </div>
    </div>
  )
}
