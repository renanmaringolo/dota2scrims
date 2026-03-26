import { memo } from 'react'
import { format, parseISO } from 'date-fns'
import type { TimeSlot } from '@/types'
import SlotStatusBadge from './SlotStatusBadge'
import { cn } from '@/lib/cn'

const borderColors = {
  available: 'border-success-600/40',
  booked: 'border-muted-500/40',
  cancelled: 'border-danger-500/40',
} as const

interface SlotCardProps {
  slot: TimeSlot
  onClick?: () => void
}

const SlotCard = memo(function SlotCard({ slot, onClick }: SlotCardProps) {
  const startTime = format(parseISO(slot.starts_at), 'HH:mm')
  const endTime = format(parseISO(slot.ends_at), 'HH:mm')
  const timeLabel = `${startTime} - ${endTime}`

  const Comp = onClick ? 'button' : 'div'

  return (
    <Comp
      className={cn(
        'flex flex-col gap-1.5 rounded-lg border bg-bg-secondary p-3 text-left transition-colors',
        borderColors[slot.status],
        onClick && 'cursor-pointer hover:bg-bg-tertiary',
      )}
      onClick={onClick}
      {...(onClick && { 'aria-label': `${timeLabel} - ${slot.status}` })}
    >
      <span className="text-sm font-medium text-text-primary">{timeLabel}</span>
      <SlotStatusBadge status={slot.status} />
    </Comp>
  )
})

export default SlotCard
