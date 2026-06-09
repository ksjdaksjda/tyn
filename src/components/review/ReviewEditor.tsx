import { useState, useEffect } from 'react'
import { X, Sparkles, Tag } from 'lucide-react'
import StarRating from '@/components/movie/StarRating'
import type { Review } from '@/types'

interface ReviewEditorProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { title: string; content: string; rating: number }) => void
  initialData?: Partial<Review>
  onAIPolish?: (content: string) => Promise<string>
  onAITags?: (content: string) => Promise<string[]>
  hasAI?: boolean
}

export default function ReviewEditor({ open, onClose, onSubmit, initialData, onAIPolish, onAITags, hasAI }: ReviewEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [rating, setRating] = useState(initialData?.rating || 0)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiTags, setAiTags] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title || '')
      setContent(initialData?.content || '')
      setRating(initialData?.rating || 0)
      setAiTags([])
    }
  }, [open, initialData])

  if (!open) return null

  const handleAIPolish = async () => {
    if (!onAIPolish || !content.trim()) return
    setAiLoading(true)
    try {
      const result = await onAIPolish(content)
      setContent(result)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setAiLoading(false)
    }
  }

  const handleAITags = async () => {
    if (!onAITags || !content.trim()) return
    setAiLoading(true)
    try {
      const tags = await onAITags(content)
      setAiTags(tags)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit({ title: title.trim(), content: content.trim(), rating }) }}
        className="relative glass max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl p-5 space-y-4"
        style={{ background: 'var(--modal-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text)]">
            {initialData ? '编辑影评' : '写影评'}
          </h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-black/10">
            <X size={18} />
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">标题</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder="这篇影评的标题..."
          />
        </div>

        {/* Rating */}
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">评分</label>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-[var(--text-muted)]">内容</label>
            <div className="flex gap-1">
              {hasAI && (
                <>
                  <button type="button" onClick={handleAIPolish} disabled={aiLoading || !content.trim()}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent2-dim)] disabled:opacity-50">
                    <Sparkles size={10} /> {aiLoading ? '润色中...' : 'AI 润色'}
                  </button>
                  <button type="button" onClick={handleAITags} disabled={aiLoading || !content.trim()}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] rounded border border-[var(--border)] text-[var(--text-muted)] hover:bg-white/10 disabled:opacity-50">
                    <Tag size={10} /> AI 标签
                  </button>
                </>
              )}
            </div>
          </div>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
            placeholder="写下你的观影感受..."
          />
        </div>

        {/* AI suggested tags */}
        {aiTags.length > 0 && (
          <div className="flex flex-wrap gap-1 p-2 rounded-lg" style={{ background: 'var(--tag-bg)' }}>
            <span className="text-[10px] text-[var(--text-muted)]">AI 推荐标签：</span>
            {aiTags.map(tag => (
              <span key={tag} className="px-1.5 py-0.5 text-[10px] rounded bg-[var(--accent)]/10 text-[var(--accent)]">{tag}</span>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
        >
          {initialData ? '💾 保存修改' : '✏️ 发布影评'}
        </button>
      </form>
    </div>
  )
}
