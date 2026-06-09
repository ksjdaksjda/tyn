import { useState } from 'react'
import { useMovies, useDeleteMovie } from '@/hooks/useMovies'
import MovieGrid from '@/components/movie/MovieGrid'
import MovieForm from '@/components/movie/MovieForm'
import type { MovieItem } from '@/types'

export default function BookshelfPage() {
  const { data } = useMovies({ type: 'book' })
  const deleteMovie = useDeleteMovie()
  const [editingItem, setEditingItem] = useState<MovieItem | undefined>()
  const [showForm, setShowForm] = useState(false)

  const items = data?.items || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text)]">📖 书架</h1>
        <span className="text-sm text-[var(--text-muted)]">{items.length} 本</span>
      </div>
      <MovieGrid
        items={items}
        onEdit={(item) => { setEditingItem(item); setShowForm(true) }}
        onDelete={(id) => { if (confirm('确定删除？')) deleteMovie.mutate(id) }}
        emptyMessage="书架上还没有书，去搜索导入吧"
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
