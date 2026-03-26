import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import useIsMobile from '@/hooks/useIsMobile'
import type { TimeSlot } from '@/types/models'
import BookingForm from './BookingForm'

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot: TimeSlot | null
}

export default function BookingModal({ open, onOpenChange, slot }: BookingModalProps) {
  const isMobile = useIsMobile()

  if (!slot) return null

  const startsAt = new Date(slot.starts_at)
  const endsAt = new Date(slot.ends_at)
  const dateStr = format(startsAt, 'dd/MM/yyyy', { locale: ptBR })
  const startTime = format(startsAt, 'HH:mm')
  const endTime = format(endsAt, 'HH:mm')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={isMobile ? 'h-full max-h-full w-full max-w-full rounded-none' : 'sm:max-w-lg'}
      >
        <DialogHeader>
          <DialogTitle>Agendar Scrim</DialogTitle>
          <DialogDescription>
            {dateStr} — {startTime} ate {endTime}
          </DialogDescription>
        </DialogHeader>

        <BookingForm
          slot={slot}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
