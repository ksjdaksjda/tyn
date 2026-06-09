import { useNavigate } from 'react-router-dom'
import { Play, BookOpen, Edit3, Trash2 } from 'lucide-react'
import type { MovieItem } from '@/types'
import StarRating from './StarRating'

interface MovieCardProps {
  item: MovieItem
  onEdit?: (item: MovieItem) => void
  onDelete?: (id: string) => void
}

export default function MovieCard({ item, onEdit, onDelete }: MovieCardProps) {
  const navigate = useNavigate()
  const isBook = item.type === 'book'

  const statusLabel: Record<string, string> = {
    want: '想看', watching: '在看', watched: '已看', paused: '暂停', dropped: '弃了'
  }

  return (
    <div
      className="cursor-pointer group"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'
        e.currentTarget.style.boxShadow = '0 16px 42px var(--shadow)'
        e.currentTarget.style.background = 'var(--bg-card-hover)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = ''
        e.currentTarget.style.background = 'var(--bg-card)'
      }}
    >
      {/* Poster */}
      <div
        className="w-full flex items-center justify-center text-[2.5rem] overflow-hidden relative"
        style={{ height: 160, background: 'var(--tag-bg)' }}
        onClick={() => navigate(isBook ? `/reader/${item.id}` : `/player/${item.id}`)}
      >
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-[0.6s] group-hover:scale-108"
            loading="lazy"
          />
        ) : (
          <span>{isBook ? '📖' : '🎬'}</span>
        )}
      </div>

      {/* Body */}
      <div className="p-3 space-y-1">
        <div
          className="text-[0.9rem] font-semibold leading-snug cursor-pointer"
          style={{ color: 'var(--text)' }}
          onClick={() => navigate(isBook ? `/reader/${item.id}` : `/player/${item.id}`)}
        >
          {item.title}
        </div>

        {(item.year || item.director || item.author) && (
          <div className="text-[0.7rem]" style={{ color: 'var(--text-muted)' }}>
            {item.year}{item.director ? ` · ${item.director}` : ''}{item.author ? ` · ${item.author}` : ''}
          </div>
        )}

        {/* Status badge */}
        <span
          className="inline-block px-2 py-0.5 rounded-lg text-[0.68rem] font-medium mt-1"
          style={{
            background: item.status === 'want' ? 'rgba(255,180,60,0.22)' :
                        item.status === 'watching' ? 'rgba(74,158,255,0.22)' :
                        item.status === 'watched' ? 'rgba(80,200,120,0.22)' : 'rgba(160,160,160,0.22)',
            color: item.status === 'want' ? '#c88020' :
                   item.status === 'watching' ? '#3878c0' :
                   item.status === 'watched' ? '#388050' : '#888',
            border: `1px solid ${item.status === 'want' ? 'rgba(255,180,60,0.35)' :
                                 item.status === 'watching' ? 'rgba(74,158,255,0.35)' :
                                 item.status === 'watched' ? 'rgba(80,200,120,0.35)' : 'rgba(160,160,160,0.35)'}`,
          }}
        >
          {statusLabel[item.status] || item.status}
        </span>

        {/* Rating */}
        <div className="mt-1">
          <StarRating value={item.rating} size="sm" readonly />
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag}
                className="inline-block px-1.5 py-0.5 rounded-md text-[0.62rem] cursor-pointer transition-all duration-200 hover:-translate-y-px"
                style={{ background: 'var(--tag-bg)', color: 'var(--text-muted)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-1 mt-2 pt-2 border-t border-[var(--border)]">
          {!isBook && (
            <button
              onClick={e => { e.stopPropagation(); navigate(`/player/${item.id}`) }}
              className="px-2 py-1 text-[0.65rem] rounded-md border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all duration-200"
              style={{ color: 'var(--text-muted)' }}
            >
              <Play size={10} className="inline mr-0.5" />播放
            </button>
          )}
          {isBook && (
            <button
              onClick={e => { e.stopPropagation(); navigate(`/reader/${item.id}`) }}
              className="px-2 py-1 text-[0.65rem] rounded-md border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all duration-200"
              style={{ color: 'var(--text-muted)' }}
            >
              <BookOpen size={10} className="inline mr-0.5" />阅读
            </button>
          )}
          <button onClick={e => { e.stopPropagation(); onEdit?.(item) }}
            className="px-2 py-1 text-[0.65rem] rounded-md border border-[var(--border)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}>
            <Edit3 size={10} className="inline mr-0.5" />编辑
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete?.(item.id) }}
            className="px-2 py-1 text-[0.65rem] rounded-md border border-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-all duration-200 ml-auto"
            style={{ color: 'var(--danger)' }}>
            <Trash2 size={10} className="inline mr-0.5" />删除
          </button>
        </div>
      </div>
    </div>
  )
}
