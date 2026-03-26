import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import { useScrims } from '@/hooks/useScrims'
import { toast } from 'sonner'
import type { ApiError } from '@/types/api'
import type { AxiosError } from 'axios'

const MIN_REASON_LENGTH = 10

interface CancelScrimDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scrimId: number
  onSuccess?: () => void
}

export default function CancelScrimDialog({
  open,
  onOpenChange,
  scrimId,
  onSuccess,
}: CancelScrimDialogProps) {
  const [reason, setReason] = useState('')
  const { cancelScrimMutation } = useScrims()
  const isValid = reason.trim().length >= MIN_REASON_LENGTH

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setReason('')
    onOpenChange(nextOpen)
  }

  const handleSubmit = () => {
    cancelScrimMutation.mutate(
      { id: scrimId, reason },
      {
        onSuccess: () => {
          toast.success('Scrim cancelada com sucesso')
          handleOpenChange(false)
          onSuccess?.()
        },
        onError: (error) => {
          const axiosError = error as AxiosError<ApiError>
          const status = axiosError.response?.status

          if (status === 409) {
            toast.error('Esta scrim ja foi cancelada')
          } else if (status && status >= 500) {
            toast.error('Erro interno, tente novamente')
          } else {
            toast.error(axiosError.response?.data?.error?.message ?? 'Erro ao cancelar scrim')
          }
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Cancelar Scrim</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. O slot voltará a ficar disponível.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <textarea
            className={cn(
              'w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground md:text-sm dark:bg-input/30',
              'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
              'resize-none',
            )}
            placeholder="Motivo do cancelamento..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {reason.length > 0 && !isValid && (
            <p className="text-sm text-muted-foreground">Minimo 10 caracteres</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Voltar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!isValid || cancelScrimMutation.isPending}
          >
            {cancelScrimMutation.isPending ? 'Cancelando...' : 'Cancelar Scrim'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
