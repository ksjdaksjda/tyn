import { useState } from 'react'
import { useMovies, useUpdateStatus, useDeleteMovie } from '@/hooks/useMovies'
import { Edit3, Trash2 } from 'lucide-react'
import StarRating from '@/components/movie/StarRating'
import MovieForm from '@/components/movie/MovieForm'
import type { MovieItem, ItemStatus } from '@/types'

const STATUS_OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: 'want', label: '想看' }, { value: 'watching', label: '在看' },
  { value: 'watched', label: '已看' }, { value: 'paused', label: '暂停' }, { value: 'dropped', label: '弃了' },
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

  const typeIcon: Record<string, string> = { movie: '🎬', tv: '📺', anime: '🎨', book: '📖' }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3.5 flex-wrap p-2.5 rounded-xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}>
        <span className="text-[0.72rem] tracking-[1px] mr-1" style={{ color: 'var(--text-muted)' }}>排序</span>
        {[{ k: 'date', l: '日期' }, { k: 'rating', l: '评分' }, { k: 'title', l: '标题' }].map(({ k, l }) => (
          <button key={k} onClick={() => setSortBy(k as any)}
            className="px-3.5 py-1.5 rounded-[16px] border text-[0.78rem] transition-all duration-[0.25s] font-[inherit]"
            style={{
              borderColor: sortBy === k ? 'var(--accent)' : 'var(--border)',
              background: sortBy === k ? 'var(--accent)' : 'var(--bg-card)',
              color: sortBy === k ? '#fff' : 'var(--text-muted)',
            }}>
            {l}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
          <thead>
            <tr>
              {['#', '标题', '类型', '状态', '评分', '日期', '操作'].map(h => (
                <th key={h} className="p-2.5 text-[0.72rem] font-normal tracking-[1px] text-left" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-12" style={{ color: 'var(--text-muted)' }}>📭 清单为空</td></tr>
            ) : sorted.map((item, idx) => (
              <tr key={item.id}>
                {[
                  <td key="n" className="p-2.5 text-[0.72rem]" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)', borderRadius: '10px 0 0 10px' }}>{idx + 1}</td>,
                  <td key="t" className="p-2.5 text-[0.82rem] font-medium" style={{ color: 'var(--text)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>{item.title}</td>,
                  <td key="tp" className="p-2.5" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>{typeIcon[item.type] || '📄'}</td>,
                  <td key="st" className="p-2.5" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    <select value={item.status} onChange={e => updateStatus.mutate({ id: item.id, status: e.target.value })}
                      className="text-[0.75rem] px-2 py-1 rounded-lg border bg-transparent font-[inherit] cursor-pointer"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>,
                  <td key="r" className="p-2.5" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    <span className="text-[0.9rem] tracking-[1.5px] cursor-pointer" style={{ color: 'var(--star-color)', textShadow: '0 0 3px var(--glow)' }}>
                      {item.rating ? '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating) : '☆☆☆☆☆'}
                    </span>
                  </td>,
                  <td key="d" className="p-2.5 text-[0.72rem]" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>{item.watchDate?.split('T')[0] || '-'}</td>,
                  <td key="a" className="p-2.5" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderRadius: '0 10px 10px 0' }}>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingItem(item); setShowForm(true) }} className="p-1 rounded hover:bg-[var(--tag-bg)]" style={{ color: 'var(--text-muted)' }}><Edit3 size={12} /></button>
                      <button onClick={() => { if (confirm('确定删除？')) deleteMovie.mutate(item.id) }} className="p-1 rounded hover:bg-[var(--tag-bg)]" style={{ color: 'var(--danger)' }}><Trash2 size={12} /></button>
                    </div>
                  </td>,
                ]}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex gap-4 mt-4 p-3 rounded-xl flex-wrap items-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <span className="text-[0.8rem]" style={{ color: 'var(--text-muted)' }}>总计: <strong className="text-[1.1rem]" style={{ color: 'var(--accent)' }}>{items.length}</strong> 部</span>
        <span className="text-[0.8rem]" style={{ color: 'var(--text-muted)' }}>已看: <strong className="text-[1.1rem]" style={{ color: 'var(--accent)' }}>{items.filter(i => i.status === 'watched').length}</strong></span>
        <span className="text-[0.8rem]" style={{ color: 'var(--text-muted)' }}>平均评分: <strong className="text-[1.1rem]" style={{ color: 'var(--accent)' }}>{items.length ? (items.reduce((s, i) => s + (i.rating || 0), 0) / items.length).toFixed(1) : '-'}</strong></span>
      </div>

      <MovieForm open={showForm} onClose={() => { setShowForm(false); setEditingItem(undefined) }}
        onSubmit={() => { setShowForm(false); setEditingItem(undefined) }} initialData={editingItem} />
    </div>
  )
}
