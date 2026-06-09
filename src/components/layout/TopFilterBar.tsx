import { Menu } from 'lucide-react'
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
}

export default function TopFilterBar({ onMenuClick, activeFilter = 'all', onFilterChange }: TopFilterBarProps) {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 p-2.5 mb-4"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-full bg-transparent border-0 text-[var(--text)]">
        <Menu size={18} />
      </button>

      <span className="text-[0.75rem] tracking-[1px] mr-1" style={{ color: 'var(--text-muted)' }}>筛选</span>

      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onFilterChange?.(f.key)}
          className={cn(
            'px-4 py-1.5 rounded-[18px] border text-[0.8rem] whitespace-nowrap font-[inherit] cursor-pointer transition-all duration-[0.25s]',
          )}
          style={{
            borderColor: activeFilter === f.key ? 'var(--accent2)' : 'var(--border)',
            background: activeFilter === f.key ? 'var(--accent2)' : 'var(--input-bg)',
            color: activeFilter === f.key ? '#fff' : 'var(--text-muted)',
            boxShadow: activeFilter === f.key ? '0 2px 10px rgba(92,192,160,0.25)' : 'none',
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
