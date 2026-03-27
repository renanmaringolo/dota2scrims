import { useState } from 'react'
import { format } from 'date-fns'
import { Copy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CancelScrimDialog from '@/components/booking/CancelScrimDialog'
import { SERVER_LABEL_MAP } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { toast } from 'sonner'
import type { Scrim } from '@/types'

interface ManagerScrimCardProps {
  scrim: Scrim
}

const STATUS_BORDER: Record<string, string> = {
  scheduled: 'border-l-4 border-l-primary-500',
  completed: 'border-l-4 border-l-success-400',
  cancelled: 'border-l-4 border-l-danger-400',
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Agendada',
  completed: 'Concluida',
  cancelled: 'Cancelada',
}

export default function ManagerScrimCard({ scrim }: ManagerScrimCardProps) {
  const [cancelOpen, setCancelOpen] = useState(false)

  const isCancellable =
    scrim.status === 'scheduled' && new Date(scrim.time_slot.starts_at) > new Date()

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast.success('Copiado!')
  }

  return (
    <div
      className={cn(
        'bg-secondary border border-surface rounded-lg p-4',
        STATUS_BORDER[scrim.status],
        scrim.status === 'cancelled' && 'opacity-60',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-text-primary">{scrim.team.name}</span>
            <Badge variant="outline">{STATUS_LABEL[scrim.status]}</Badge>
            <Badge variant="secondary">
              {SERVER_LABEL_MAP[scrim.server_host ?? ''] ?? scrim.server_host}
            </Badge>
          </div>

          <p className="text-sm text-text-secondary">
            {format(new Date(scrim.time_slot.starts_at), 'dd/MM/yyyy HH:mm')}
          </p>

          {scrim.lobby_name && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-text-muted">Lobby:</span>
              <span className="text-text-primary">{scrim.lobby_name}</span>
              {scrim.lobby_password && (
                <>
                  <span className="font-mono text-text-primary">{scrim.lobby_password}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-11 sm:h-6 sm:w-6 p-0"
                    aria-label="Copiar senha"
                    onClick={() => copyToClipboard(scrim.lobby_password!)}
                  >
                    <Copy className="size-3" />
                  </Button>
                </>
              )}
            </div>
          )}

          {scrim.cancellation_reason && (
            <p className="text-sm text-text-muted italic">
              Motivo: {scrim.cancellation_reason}
            </p>
          )}
        </div>

        {isCancellable && (
          <Button
            variant="destructive"
            size="sm"
            aria-label={`Cancelar scrim contra ${scrim.team.name}`}
            onClick={() => setCancelOpen(true)}
          >
            Cancelar
          </Button>
        )}
      </div>

      <CancelScrimDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        scrimId={scrim.id}
      />
    </div>
  )
}
