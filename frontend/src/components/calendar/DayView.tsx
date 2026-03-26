import { parseISO, isSameDay } from 'date-fns'
import type { TimeSlot } from '@/types'
import SlotCard from './SlotCard'
import EmptyState from '@/components/shared/EmptyState'

interface DayViewProps {
  slots: TimeSlot[]
  selectedDate: Date
}

export default function DayView({ slots, selectedDate }: DayViewProps) {
  const daySlots = slots.filter((slot) => isSameDay(parseISO(slot.starts_at), selectedDate))

  if (daySlots.length === 0) {
    return <EmptyState title="Sem slots" description="Nenhum horário disponível para este dia." />
  }

  return (
    <div className="flex flex-col gap-3">
      {daySlots.map((slot) => (
        <SlotCard key={slot.id} slot={slot} />
      ))}
    </div>
  )
}
