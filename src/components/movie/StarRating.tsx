import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

export default function StarRating({ value, onChange, size = 'md', readonly }: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-2xl' : 'text-base'

  return (
    <div className={cn('flex gap-0.5', sizeClass)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            'transition-all duration-150',
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
            star <= value ? 'text-[var(--star-color)]' : 'text-gray-300 dark:text-gray-600',
          )}
        >
          {star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}
