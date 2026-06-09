import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMovies, useCreateMovie, useDeleteMovie } from '@/hooks/useMovies'
import MovieGrid from '@/components/movie/MovieGrid'
import MovieForm from '@/components/movie/MovieForm'
import type { MovieItem } from '@/types'

export default function HomePage() {
  const navigate = useNavigate()
  const { data } = useMovies()
  const createMovie = useCreateMovie()
  const deleteMovie = useDeleteMovie()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MovieItem | undefined>()

  const items = data?.items || []
  const stats = [
    { label: '电影', count: items.filter(i => i.type === 'movie').length },
    { label: '电视剧', count: items.filter(i => i.type === 'tv').length },
    { label: '动漫', count: items.filter(i => i.type === 'anime').length },
    { label: '书籍', count: items.filter(i => i.type === 'book').length },
  ]
  const recentItems = items.slice(0, 12)

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-10 px-5">
        <h1 className="text-[2.4rem] font-light tracking-[6px] mb-2 text-shimmer">🌳 树洞</h1>
        <p className="text-[0.95rem] tracking-[2px]" style={{ color: 'var(--text-muted)' }}>电子手帐观影管理系统</p>
      </div>

      {/* Quick actions */}
      <div className="flex justify-center gap-2.5 mb-7 flex-wrap">
        <button onClick={() => { setEditingItem(undefined); setShowForm(true) }}
          className="btn btn-primary">+ 添加作品</button>
        <button onClick={() => navigate('/import')} className="btn">🔍 搜索导入</button>
        <button onClick={() => navigate('/shelf')} className="btn">📚 观影架</button>
      </div>

      {/* Stats bar */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {stats.map(({ label, count }) => (
          <div key={label}
            className="glass text-center min-w-[90px] px-5 py-3 cursor-pointer hover:-translate-y-1"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              transition: 'all 0.3s ease',
            }}>
            <div className="text-[1.5rem] font-bold" style={{ color: 'var(--accent)' }}>{count}</div>
            <div className="text-[0.7rem] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Recent items */}
      <h2 className="section-title">📌 最近添加</h2>
      <MovieGrid
        items={recentItems}
        onEdit={(item) => { setEditingItem(item); setShowForm(true) }}
        onDelete={(id) => { if (confirm('确定删除？')) deleteMovie.mutate(id) }}
        emptyMessage="还没有观影记录，去「搜索导入」添加你的第一部作品吧"
      />

      <MovieForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingItem(undefined) }}
        onSubmit={(data) => {
          if (editingItem) { /* update logic */ }
          else { createMovie.mutate(data) }
          setShowForm(false); setEditingItem(undefined)
        }}
        initialData={editingItem}
      />
    </div>
  )
}
