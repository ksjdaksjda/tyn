import { useState } from 'react'
import { useMovies, useDeleteMovie } from '@/hooks/useMovies'
import MovieGrid from '@/components/movie/MovieGrid'
import MovieForm from '@/components/movie/MovieForm'
import type { MovieItem } from '@/types'

export default function WatchlistPage() {
  const { data } = useMovies({ status: 'want' })
  const deleteMovie = useDeleteMovie()
  const [editingItem, setEditingItem] = useState<MovieItem | undefined>()
  const [showForm, setShowForm] = useState(false)

  const items = data?.items || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text)]">📌 想看清单</h1>
        <span className="text-sm text-[var(--text-muted)]">{items.length} 部</span>
      </div>
      <MovieGrid
        items={items}
        onEdit={(item) => { setEditingItem(item); setShowForm(true) }}
        onDelete={(id) => { if (confirm('确定删除？')) deleteMovie.mutate(id) }}
        emptyMessage="还没有想看的作品，去搜索添加吧"
      />
      <MovieForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingItem(undefined) }}
        onSubmit={() => { setShowForm(false); setEditingItem(undefined) }}
        initialData={editingItem}
      />
    </div>
  )
}
