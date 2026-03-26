import { memo } from 'react'
import { format, parseISO } from 'date-fns'
import type { TimeSlot } from '@/types'
import SlotStatusBadge from './SlotStatusBadge'
import { cn } from '@/lib/cn'
import { Clock } from 'lucide-react'

const statusStyles = {
  available: 'border-primary-400/30 bg-primary-400/5 hover:border-primary-400/50 hover:bg-primary-400/10',
  booked: 'border-border-bright bg-bg-secondary/50',
  cancelled: 'border-danger-500/20 bg-danger-500/5 opacity-60',
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
        'group flex flex-col gap-2 rounded-xl border p-3 text-left transition-all duration-200',
        statusStyles[slot.status],
        onClick && 'cursor-pointer hover:shadow-[0_0_15px_rgba(102,252,241,0.1)]',
      )}
      onClick={onClick}
      {...(onClick && { 'aria-label': `${timeLabel} - ${slot.status}` })}
    >
      <div className="flex items-center gap-1.5">
        <Clock className={cn(
          'size-3.5',
          slot.status === 'available' ? 'text-primary-400' : 'text-text-muted',
        )} />
        <span className={cn(
          'text-sm font-semibold',
          slot.status === 'available' ? 'text-text-primary' : 'text-text-secondary',
        )}>
          {timeLabel}
        </span>
      </div>
      <SlotStatusBadge status={slot.status} />
    </Comp>
  )
})

export default SlotCard
