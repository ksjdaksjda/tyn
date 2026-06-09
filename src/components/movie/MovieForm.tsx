import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import type { MovieItem, ItemType, ItemStatus } from '@/types'
import StarRating from './StarRating'

interface MovieFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<MovieItem>) => void
  initialData?: Partial<MovieItem>
}

const TYPES: { value: ItemType; label: string }[] = [
  { value: 'movie', label: '🎬 电影' },
  { value: 'tv', label: '📺 电视剧' },
  { value: 'anime', label: '🎨 动漫' },
  { value: 'book', label: '📖 书籍' },
]

const STATUSES: { value: ItemStatus; label: string }[] = [
  { value: 'want', label: '想看' },
  { value: 'watching', label: '在看' },
  { value: 'watched', label: '已看' },
  { value: 'paused', label: '暂停' },
  { value: 'dropped', label: '弃了' },
]

export default function MovieForm({ open, onClose, onSubmit, initialData }: MovieFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [originalTitle, setOriginalTitle] = useState(initialData?.originalTitle || '')
  const [type, setType] = useState<ItemType>(initialData?.type || 'movie')
  const [status, setStatus] = useState<ItemStatus>(initialData?.status || 'want')
  const [rating, setRating] = useState(initialData?.rating || 0)
  const [year, setYear] = useState(initialData?.year?.toString() || '')
  const [director, setDirector] = useState(initialData?.director || '')
  const [author, setAuthor] = useState(initialData?.author || '')
  const [coverUrl, setCoverUrl] = useState(initialData?.coverUrl || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '')
  const [genres, setGenres] = useState(initialData?.genres?.join(', ') || '')
  const [watchDate, setWatchDate] = useState(initialData?.watchDate?.split('T')[0] || '')

  if (!open) return null

  const isBook = type === 'book'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title: title.trim(),
      originalTitle: originalTitle.trim() || undefined,
      type,
      status,
      rating,
      year: year ? parseInt(year) : undefined,
      director: director.trim() || undefined,
      author: author.trim() || undefined,
      coverUrl: coverUrl.trim() || undefined,
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: tags.split(/[,，、]/).map(t => t.trim()).filter(Boolean),
      genres: genres.split(/[,，、]/).map(t => t.trim()).filter(Boolean),
      watchDate: watchDate || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <form
        onSubmit={handleSubmit}
        className="relative glass max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-2xl p-5 space-y-4"
        style={{ background: 'var(--modal-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text)]">
            {initialData ? '编辑' : '添加'}作品
          </h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-black/10">
            <X size={18} />
          </button>
        </div>

        {/* Type selector */}
        <div className="flex gap-1">
          {TYPES.map((t) => (
            <button
              type="button"
              key={t.value}
              onClick={() => setType(t.value)}
              className="flex-1 py-1.5 text-xs rounded-lg border transition-all"
              style={{
                borderColor: type === t.value ? 'var(--accent)' : 'var(--border)',
                background: type === t.value ? 'var(--accent2-dim)' : 'transparent',
                color: type === t.value ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Title */}
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">标题 *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder={isBook ? '书名' : '片名'}
          />
        </div>

        {/* Original title */}
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">原名</label>
          <input
            value={originalTitle}
            onChange={(e) => setOriginalTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        {/* Year + Director/Author */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">年份</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">{isBook ? '作者' : '导演'}</label>
            <input
              value={isBook ? author : director}
              onChange={(e) => isBook ? setAuthor(e.target.value) : setDirector(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
        </div>

        {/* Status + Rating */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">状态</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ItemStatus)}
              className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)]"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">评分</label>
            <div className="pt-1">
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
          </div>
        </div>

        {/* Cover URL */}
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">封面图片 URL</label>
          <input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            placeholder="https://..."
          />
          {coverUrl && (
            <img src={coverUrl} alt="预览" className="mt-2 w-24 h-36 object-cover rounded-lg" />
          )}
        </div>

        {/* Genres + Tags */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">类型标签 (逗号分隔)</label>
            <input
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="科幻, 动作, 冒险"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">个人标签</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="催泪, 必看"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">简介</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
          />
        </div>

        {/* Watch Date */}
        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">观看日期</label>
          <input
            type="date"
            value={watchDate}
            onChange={(e) => setWatchDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
        >
          {initialData ? '💾 保存修改' : '✨ 添加作品'}
        </button>
      </form>
    </div>
  )
}
