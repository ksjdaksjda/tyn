import { Edit3, Trash2, Archive, RotateCcw, Eye } from 'lucide-react'
import StarRating from '@/components/movie/StarRating'
import type { Review, MovieItem } from '@/types'

interface ReviewCardProps {
  review: Review
  item?: MovieItem
  onView: (review: Review) => void
  onEdit: (review: Review) => void
  onDelete: (id: string) => void
  onToggleArchive: (id: string) => void
}

export default function ReviewCard({ review, item, onView, onEdit, onDelete, onToggleArchive }: ReviewCardProps) {
  return (
    <div className="glass glass-hover p-4 space-y-2 transition-all">
      <div className="flex gap-3">
        {/* Movie cover thumbnail */}
        <div className="w-12 h-16 shrink-0 rounded overflow-hidden bg-gray-100"
          onClick={() => onView(review)}>
          {item?.coverUrl ? (
            <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover cursor-pointer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg">🎬</div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onView(review)}>
          <h3 className="font-semibold text-sm text-[var(--text)] line-clamp-1">{review.title}</h3>
          {item && (
            <p className="text-xs text-[var(--accent)] mt-0.5">{item.title}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <StarRating value={review.rating} size="sm" readonly />
            <span className="text-[10px] text-[var(--text-muted)]">
              {new Date(review.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">{review.content}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 pt-2 border-t border-[var(--border)]">
        <button onClick={() => onView(review)} className="p-1.5 rounded hover:bg-white/10 text-[var(--text-muted)]" title="查看">
          <Eye size={14} />
        </button>
        <button onClick={() => onEdit(review)} className="p-1.5 rounded hover:bg-white/10 text-[var(--text-muted)]" title="编辑">
          <Edit3 size={14} />
        </button>
        <button onClick={() => onToggleArchive(review.id)} className="p-1.5 rounded hover:bg-white/10 text-[var(--text-muted)]" title={review.isArchived ? '取消归档' : '归档'}>
          {review.isArchived ? <RotateCcw size={14} /> : <Archive size={14} />}
        </button>
        <button onClick={() => { if (confirm('确定删除这篇影评？')) onDelete(review.id) }} className="p-1.5 rounded hover:bg-white/10 text-[var(--danger)] ml-auto" title="删除">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
