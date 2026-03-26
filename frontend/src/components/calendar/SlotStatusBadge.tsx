import { Badge } from '@/components/ui/badge'
import type { SlotStatus } from '@/types'

const statusConfig = {
  available: { label: 'Disponível', className: 'bg-success-600/20 text-success-400 border-success-600/30' },
  booked: { label: 'Indisponível', className: 'bg-muted-500/20 text-muted-foreground border-muted-500/30' },
  cancelled: { label: 'Cancelado', className: 'bg-danger-500/20 text-danger-400 border-danger-500/30' },
} as const

interface SlotStatusBadgeProps {
  status: SlotStatus
}

export default function SlotStatusBadge({ status }: SlotStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
