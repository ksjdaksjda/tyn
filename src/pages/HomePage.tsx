import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, TrendingUp, Clock, Star, Film, Tv, Palette, BookOpen } from 'lucide-react'
import { useMovies, useCreateMovie, useDeleteMovie } from '@/hooks/useMovies'
import MovieGrid from '@/components/movie/MovieGrid'
import MovieForm from '@/components/movie/MovieForm'
import type { MovieItem } from '@/types'

export default function HomePage() {
  const navigate = useNavigate()
  const { data, isLoading } = useMovies()
  const createMovie = useCreateMovie()
  const deleteMovie = useDeleteMovie()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MovieItem | undefined>()

  const items = data?.items || []
  const stats = [
    { label: '电影', count: items.filter(i => i.type === 'movie').length, icon: Film },
    { label: '电视剧', count: items.filter(i => i.type === 'tv').length, icon: Tv },
    { label: '动漫', count: items.filter(i => i.type === 'anime').length, icon: Palette },
    { label: '书籍', count: items.filter(i => i.type === 'book').length, icon: BookOpen },
  ]
  const recentItems = items.slice(0, 12)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text)]">📊 观影概览</h1>
        <button
          onClick={() => { setEditingItem(undefined); setShowForm(true) }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
        >
          <Plus size={16} /> 添加作品
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ label, count, icon: Icon }) => (
          <div key={label} className="glass p-4 text-center transition-all hover:scale-[1.02]">
            <Icon size={20} className="mx-auto mb-1 text-[var(--accent)]" />
            <p className="text-2xl font-bold text-shimmer">{isLoading ? '-' : count}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent items */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text)] mb-3">📌 最近添加</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass animate-pulse aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : (
          <MovieGrid
            items={recentItems}
            onEdit={(item) => { setEditingItem(item); setShowForm(true) }}
            onDelete={(id) => { if (confirm('确定删除？')) deleteMovie.mutate(id) }}
            emptyMessage="还没有观影记录，去「媒体搜索」导入你的第一部作品吧"
          />
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => navigate('/import')} className="px-4 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--accent)] hover:bg-white/10">
          🔍 搜索导入影视
        </button>
        <button onClick={() => navigate('/shelf')} className="px-4 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--text)] hover:bg-white/10">
          📚 浏览观影架
        </button>
        <button onClick={() => navigate('/watchlist')} className="px-4 py-2 rounded-lg text-sm border border-[var(--border)] text-[var(--text)] hover:bg-white/10">
          📌 看想看清单
        </button>
      </div>

      {/* Movie Form Modal */}
      <MovieForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingItem(undefined) }}
        onSubmit={(data) => {
          if (editingItem) {
            // Update
          } else {
            createMovie.mutate(data)
          }
          setShowForm(false)
          setEditingItem(undefined)
        }}
        initialData={editingItem}
      />
    </div>
  )
}
