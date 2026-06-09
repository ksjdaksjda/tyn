import { useNavigate } from 'react-router-dom'
import { X, Play, BookOpen, Edit3, Trash2, Clock, Tag, Globe, Star } from 'lucide-react'
import type { MovieItem } from '@/types'
import StarRating from './StarRating'
import StatusBadge from './StatusBadge'
import { cn } from '@/lib/utils'

interface MovieDetailProps {
  item: MovieItem
  open: boolean
  onClose: () => void
  onEdit?: (item: MovieItem) => void
  onDelete?: (id: string) => void
}

export default function MovieDetail({ item, open, onClose, onEdit, onDelete }: MovieDetailProps) {
  const navigate = useNavigate()
  if (!open) return null

  const isBook = item.type === 'book'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative glass max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: 'var(--modal-bg)' }}
        onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/10 hover:bg-black/20">
          <X size={18} />
        </button>

        {/* Cover + Header */}
        <div className="flex flex-col sm:flex-row gap-4 p-5">
          {/* Cover */}
          <div className="w-32 h-48 shrink-0 mx-auto sm:mx-0 rounded-lg overflow-hidden bg-gray-100">
            {item.coverUrl ? (
              <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                {isBook ? '📖' : '🎬'}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <h2 className="text-xl font-bold text-[var(--text)]">{item.title}</h2>
            {item.originalTitle && (
              <p className="text-sm text-[var(--text-muted)]">{item.originalTitle}</p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={item.status} size="md" />
              <StarRating value={item.rating} size="md" readonly />
              <span className="text-sm text-[var(--text-muted)]">{item.rating}/5</span>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
              {item.year && <span>📅 {item.year}</span>}
              {item.director && <span>🎬 {item.director}</span>}
              {item.author && <span>✍️ {item.author}</span>}
              {item.country && <span>🌍 {item.country}</span>}
              {item.language && <span>🔤 {item.language}</span>}
              {item.runtime && <span>⏱️ {item.runtime}分钟</span>}
            </div>

            {/* Genres / Tags */}
            {item.genres && item.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.genres.map((g) => (
                  <span key={g} className="px-2 py-0.5 text-[10px] rounded-full"
                    style={{ background: 'var(--tag-bg)', color: 'var(--accent)' }}>
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {item.description && (
              <p className="text-sm text-[var(--text-muted)] line-clamp-4">{item.description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5 border-t border-[var(--border)] pt-4">
          {!isBook && item.playUrls && item.playUrls.length > 0 && (
            <button
              onClick={() => navigate(`/player/${item.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
              <Play size={14} /> 播放
            </button>
          )}
          {isBook && (
            <button
              onClick={() => navigate(`/reader/${item.id}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
              <BookOpen size={14} /> 阅读
            </button>
          )}
          <button onClick={() => onEdit?.(item)} className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text)]">
            <Edit3 size={14} /> 编辑
          </button>
          <button onClick={() => onDelete?.(item.id)} className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--danger)] text-sm text-[var(--danger)]">
            <Trash2 size={14} /> 删除
          </button>
        </div>
      </div>
    </div>
  )
}
