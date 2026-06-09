import { Menu, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'movie', label: '🎬 电影' },
  { key: 'tv', label: '📺 电视剧' },
  { key: 'anime', label: '🎨 动漫' },
  { key: 'book', label: '📖 书籍' },
] as const

interface TopFilterBarProps {
  onMenuClick?: () => void
  activeFilter?: string
  onFilterChange?: (key: string) => void
  showSearch?: boolean
  searchValue?: string
  onSearchChange?: (v: string) => void
}

export default function TopFilterBar({
  onMenuClick,
  activeFilter = 'all',
  onFilterChange,
  showSearch = false,
  searchValue = '',
  onSearchChange,
}: TopFilterBarProps) {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 p-3 border-b border-[var(--border)]"
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-[var(--text)]"
      >
        <Menu size={20} />
      </button>

      {/* Filter pills */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange?.(f.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200',
              activeFilter === f.key
                ? 'text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:bg-white/10',
            )}
            style={activeFilter === f.key
              ? { background: `linear-gradient(135deg, var(--accent), var(--accent2))` }
              : undefined}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {showSearch && (
        <div className="relative ml-auto max-w-[200px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="搜索..."
            className="w-full pl-7 pr-3 py-1.5 rounded-lg text-xs border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      )}
    </div>
  )
}
