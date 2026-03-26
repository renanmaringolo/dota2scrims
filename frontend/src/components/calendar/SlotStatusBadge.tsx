import { Badge } from '@/components/ui/badge'
import type { SlotStatus } from '@/types'

const statusConfig = {
  available: { label: 'Disponivel', className: 'bg-primary-400/15 text-primary-400 border-primary-400/25' },
  booked: { label: 'Reservado', className: 'bg-muted-500/15 text-text-muted border-muted-500/25' },
  cancelled: { label: 'Cancelado', className: 'bg-danger-500/15 text-danger-400 border-danger-500/25' },
} as const

interface SlotStatusBadgeProps {
  status: SlotStatus
}

export default function SlotStatusBadge({ status }: SlotStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={`text-xs ${config.className}`}>
      {config.label}
    </Badge>
  )
}
