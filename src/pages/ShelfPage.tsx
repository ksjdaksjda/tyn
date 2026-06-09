import { useState } from 'react'
import { useMovies, useUpdateStatus, useDeleteMovie } from '@/hooks/useMovies'
import MovieGrid from '@/components/movie/MovieGrid'
import MovieDetail from '@/components/movie/MovieDetail'
import MovieForm from '@/components/movie/MovieForm'
import TopFilterBar from '@/components/layout/TopFilterBar'
import type { MovieItem } from '@/types'

export default function ShelfPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState<MovieItem | null>(null)
  const [editingItem, setEditingItem] = useState<MovieItem | undefined>()
  const [showForm, setShowForm] = useState(false)

  const typeParam = activeFilter === 'all' ? undefined : activeFilter
  const { data, isLoading } = useMovies({ type: typeParam })
  const updateStatus = useUpdateStatus()
  const deleteMovie = useDeleteMovie()

  const items = data?.items || []

  return (
    <div className="space-y-4">
      <TopFilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <h1 className="text-2xl font-bold text-[var(--text)]">📚 观影架</h1>
      <MovieGrid
        items={items}
        onEdit={(item) => { setEditingItem(item); setShowForm(true) }}
        onDelete={(id) => { if (confirm('确定删除？')) deleteMovie.mutate(id) }}
        emptyMessage="观影架空空如也，去「媒体搜索」添加作品吧"
      />

      <MovieDetail
        item={selectedItem!}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onEdit={(item) => { setEditingItem(item); setShowForm(true); setSelectedItem(null) }}
        onDelete={(id) => { if (confirm('确定删除？')) { deleteMovie.mutate(id); setSelectedItem(null) } }}
      />

      <MovieForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingItem(undefined) }}
        onSubmit={(data) => {
          setShowForm(false)
          setEditingItem(undefined)
        }}
        initialData={editingItem}
      />
    </div>
  )
}
