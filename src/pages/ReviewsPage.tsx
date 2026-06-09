import { useState } from 'react'
import { Archive, RotateCcw, Plus } from 'lucide-react'
import { useReviews, useCreateReview, useUpdateReview, useDeleteReview, useToggleArchive, useBatchArchive, useBatchRestore } from '@/hooks/useReviews'
import { useMovies } from '@/hooks/useMovies'
import { useAI } from '@/hooks/useAI'
import ReviewCard from '@/components/review/ReviewCard'
import ReviewEditor from '@/components/review/ReviewEditor'
import SharePoster from '@/components/review/SharePoster'
import type { Review, MovieItem } from '@/types'

type FilterMode = 'all' | 'active' | 'archived'

export default function ReviewsPage() {
  const [filter, setFilter] = useState<FilterMode>('all')
  const [showEditor, setShowEditor] = useState(false)
  const [editingReview, setEditingReview] = useState<Partial<Review> | undefined>()
  const [viewingReview, setViewingReview] = useState<Review | undefined>()
  const [selectedItemId, setSelectedItemId] = useState<string>('')

  const archivedParam = filter === 'all' ? undefined : filter === 'archived' ? 1 : 0
  const { data: reviewsData } = useReviews(archivedParam !== undefined ? { archived: archivedParam } : undefined)
  const { data: moviesData } = useMovies()
  const createReview = useCreateReview()
  const updateReview = useUpdateReview()
  const deleteReview = useDeleteReview()
  const toggleArchive = useToggleArchive()
  const batchArchive = useBatchArchive()
  const batchRestore = useBatchRestore()
  const { polish, generateTags, hasKey } = useAI()

  const reviews = reviewsData?.reviews || []
  const items = moviesData?.items || []

  function getItem(movieId: string): MovieItem | undefined {
    return items.find(i => i.id === movieId)
  }

  const handleSubmit = (data: { title: string; content: string; rating: number }) => {
    if (editingReview?.id) {
      updateReview.mutate({ id: editingReview.id, ...data })
    } else {
      createReview.mutate({ itemId: selectedItemId, ...data })
    }
    setShowEditor(false)
    setEditingReview(undefined)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-[var(--text)]">📝 影评</h1>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
          >
            <Plus size={16} /> 写影评
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {[
            { key: 'all' as FilterMode, label: '全部影评' },
            { key: 'active' as FilterMode, label: '未归档' },
            { key: 'archived' as FilterMode, label: '已归档' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 text-xs rounded-lg border transition-all"
              style={{
                borderColor: filter === f.key ? 'var(--accent)' : 'var(--border)',
                color: filter === f.key ? 'var(--accent)' : 'var(--text-muted)',
                background: filter === f.key ? 'var(--accent2-dim)' : 'transparent',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button onClick={() => batchArchive.mutate()} className="flex items-center gap-1 px-2 py-1.5 text-[10px] rounded border border-[var(--border)] text-[var(--text-muted)] hover:bg-white/10">
            <Archive size={10} /> 批量归档
          </button>
          <button onClick={() => batchRestore.mutate()} className="flex items-center gap-1 px-2 py-1.5 text-[10px] rounded border border-[var(--border)] text-[var(--text-muted)] hover:bg-white/10">
            <RotateCcw size={10} /> 批量恢复
          </button>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="glass p-12 text-center text-[var(--text-muted)]">
            <p className="text-lg">📭 还没有写影评</p>
            <p className="text-sm mt-2">选择一部作品，记录你的观影感受吧</p>
          </div>
        ) : (
          reviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              item={getItem(review.itemId)}
              onView={(r) => setViewingReview(r)}
              onEdit={(r) => { setEditingReview(r); setSelectedItemId(r.itemId); setShowEditor(true) }}
              onDelete={(id) => deleteReview.mutate(id)}
              onToggleArchive={(id) => toggleArchive.mutate(id)}
            />
          ))
        )}
      </div>

      {/* Review Editor Modal */}
      <ReviewEditor
        open={showEditor}
        onClose={() => { setShowEditor(false); setEditingReview(undefined) }}
        onSubmit={handleSubmit}
        initialData={editingReview}
        onAIPolish={hasKey ? (content) => polish(content) : undefined}
        onAITags={hasKey ? (content) => generateTags(content) : undefined}
        hasAI={hasKey}
      />

      {/* Review Detail / Poster Modal */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setViewingReview(undefined)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative glass max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-2xl p-5 space-y-4"
            style={{ background: 'var(--modal-bg)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text)]">{viewingReview.title}</h2>
              <button onClick={() => setViewingReview(undefined)} className="p-1 rounded-lg hover:bg-black/10">✕</button>
            </div>

            {getItem(viewingReview.itemId) && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[var(--accent)]">{getItem(viewingReview.itemId)?.title}</span>
                <span className="text-[var(--text-muted)]">
                  ⭐ {viewingReview.rating}/5
                </span>
                <span className="text-[var(--text-muted)] text-xs">
                  {new Date(viewingReview.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            )}

            <p className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">
              {viewingReview.content}
            </p>

            {/* Share Poster */}
            <div className="pt-4 border-t border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text)] mb-3">📸 分享海报</h3>
              <SharePoster review={viewingReview} item={getItem(viewingReview.itemId)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
