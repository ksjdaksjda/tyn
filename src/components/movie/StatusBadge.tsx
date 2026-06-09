import { cn } from '@/lib/utils'
import type { ItemStatus } from '@/types'

const STATUS_CONFIG: Record<ItemStatus, { label: string; color: string }> = {
  want: { label: '想看', color: '#8a9ac0' },
  watching: { label: '在看', color: '#5cc0a0' },
  watched: { label: '已看', color: '#c8a040' },
  paused: { label: '暂停', color: '#c08080' },
  dropped: { label: '弃了', color: '#999' },
}

interface StatusBadgeProps {
  status: ItemStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, color: '#999' }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
      )}
      style={{ background: `${config.color}20`, color: config.color }}
    >
      {config.label}
    </span>
  )
}
