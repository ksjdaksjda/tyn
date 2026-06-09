import type { MovieItem } from '@/types'
import MovieCard from './MovieCard'

interface MovieGridProps {
  items: MovieItem[]
  onEdit?: (item: MovieItem) => void
  onDelete?: (id: string) => void
  emptyMessage?: string
}

export default function MovieGrid({ items, onEdit, onDelete, emptyMessage = '暂无内容' }: MovieGridProps) {
  if (items.length === 0) {
    return (
      <div className="glass p-12 text-center text-[var(--text-muted)]">
        <p className="text-lg">📭 {emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <MovieCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
