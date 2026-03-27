import { useCallback, useState } from 'react'
import { format, parseISO } from 'date-fns'

interface TimeSlotEvent {
  event: 'slot_created' | 'slot_booked' | 'slot_cancelled'
  data: {
    id: number
    starts_at: string
    ends_at: string
    status: 'available' | 'booked' | 'cancelled'
  }
}

const STATUS_LABELS: Record<string, string> = {
  available: 'disponível',
  booked: 'reservado',
  cancelled: 'cancelado',
}

export function useSlotAnnouncer() {
  const [message, setMessage] = useState('')

  const announce = useCallback((event: TimeSlotEvent) => {
    const startTime = format(parseISO(event.data.starts_at), 'HH:mm')
    const endTime = format(parseISO(event.data.ends_at), 'HH:mm')
    const statusLabel = STATUS_LABELS[event.data.status] ?? event.data.status
    setMessage(`Slot atualizado: ${startTime} - ${endTime} agora está ${statusLabel}`)
  }, [])

  return { message, announce }
}
