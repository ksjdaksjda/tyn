import { useState } from 'react'
import { useMovies, useUpdateStatus, useDeleteMovie } from '@/hooks/useMovies'
import { Edit3, Trash2 } from 'lucide-react'
import StarRating from '@/components/movie/StarRating'
import MovieForm from '@/components/movie/MovieForm'
import type { MovieItem, ItemStatus } from '@/types'

const STATUSES: { value: ItemStatus; label: string }[] = [
  { value: 'want', label: '想看' },
  { value: 'watching', label: '在看' },
  { value: 'watched', label: '已看' },
  { value: 'paused', label: '暂停' },
  { value: 'dropped', label: '弃了' },
]

export default function ChecklistPage() {
  const { data } = useMovies()
  const updateStatus = useUpdateStatus()
  const deleteMovie = useDeleteMovie()
  const [editingItem, setEditingItem] = useState<MovieItem | undefined>()
  const [showForm, setShowForm] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'title'>('date')

  const items = data?.items || []
  const sorted = [...items].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'title') return a.title.localeCompare(b.title)
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-[var(--text)]">📋 观影清单</h1>
        <div className="flex gap-1">
          {[{ key: 'date', label: '日期' }, { key: 'rating', label: '评分' }, { key: 'title', label: '标题' }].map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key as any)}
              className="px-2 py-1 text-xs rounded border"
              style={{
                borderColor: sortBy === s.key ? 'var(--accent)' : 'var(--border)',
                color: sortBy === s.key ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
              <th className="p-3 w-12">#</th>
              <th className="p-3">标题</th>
              <th className="p-3">类型</th>
              <th className="p-3">状态</th>
              <th className="p-3">评分</th>
              <th className="p-3">日期</th>
              <th className="p-3 w-20">操作</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-[var(--text-muted)]">📭 清单为空</td>
              </tr>
            ) : (
              sorted.map((item, idx) => (
                <tr key={item.id} className="border-b border-[var(--border)] hover:bg-white/5">
                  <td className="p-3 text-[var(--text-muted)]">{idx + 1}</td>
                  <td className="p-3 font-medium text-[var(--text)]">{item.title}</td>
                  <td className="p-3 text-xs text-[var(--text-muted)]">
                    {({ movie: '🎬', tv: '📺', anime: '🎨', book: '📖' } as Record<string, string>)[item.type] || '📄'}
                  </td>
                  <td className="p-3">
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus.mutate({ id: item.id, status: e.target.value })}
                      className="text-xs px-1.5 py-0.5 rounded border border-[var(--border)] bg-transparent text-[var(--text)]"
                    >
                      {STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3"><StarRating value={item.rating} size="sm" readonly /></td>
                  <td className="p-3 text-xs text-[var(--text-muted)]">{item.watchDate?.split('T')[0] || '-'}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingItem(item); setShowForm(true) }} className="p-1 rounded hover:bg-white/10">
                        <Edit3 size={12} />
                      </button>
                      <button onClick={() => { if (confirm('确定删除？')) deleteMovie.mutate(item.id) }} className="p-1 rounded hover:bg-white/10 text-[var(--danger)]">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <MovieForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingItem(undefined) }}
        onSubmit={() => { setShowForm(false); setEditingItem(undefined) }}
        initialData={editingItem}
      />
    </div>
  )
}
