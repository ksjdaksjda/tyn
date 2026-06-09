import { useNavigate } from 'react-router-dom'
import { Play, BookOpen, Edit3, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MovieItem } from '@/types'
import StarRating from './StarRating'
import StatusBadge from './StatusBadge'

interface MovieCardProps {
  item: MovieItem
  onEdit?: (item: MovieItem) => void
  onDelete?: (id: string) => void
}

export default function MovieCard({ item, onEdit, onDelete }: MovieCardProps) {
  const navigate = useNavigate()
  const isBook = item.type === 'book'

  return (
    <div className="glass glass-hover group relative overflow-hidden transition-all duration-300 cursor-pointer"
      onClick={() => navigate(isBook ? `/reader/${item.id}` : `/player/${item.id}`)}>
      {/* Cover image */}
      <div className="aspect-[2/3] relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {isBook ? '📖' : '🎬'}
          </div>
        )}

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          {!isBook && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/player/${item.id}`) }}
              className="p-2 rounded-full bg-white/90 text-gray-800 hover:bg-white transition-colors"
              title="播放"
            >
              <Play size={16} />
            </button>
          )}
          {isBook && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/reader/${item.id}`) }}
              className="p-2 rounded-full bg-white/90 text-gray-800 hover:bg-white transition-colors"
              title="阅读"
            >
              <BookOpen size={16} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(item) }}
            className="p-2 rounded-full bg-white/90 text-gray-800 hover:bg-white transition-colors"
            title="编辑"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(item.id) }}
            className="p-2 rounded-full bg-white/90 text-red-500 hover:bg-white transition-colors"
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm text-[var(--text)] line-clamp-1" title={item.title}>
            {item.title}
          </h3>
          <StatusBadge status={item.status} />
        </div>

        {item.year && (
          <p className="text-[10px] text-[var(--text-muted)]">{item.year}{item.director ? ` · ${item.director}` : ''}{item.author ? ` · ${item.author}` : ''}</p>
        )}

        <div className="flex items-center justify-between">
          <StarRating value={item.rating} size="sm" readonly />
          {item.genres && item.genres.length > 0 && (
            <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[100px]">
              {item.genres[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
