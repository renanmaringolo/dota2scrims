import { startOfWeek, addDays, format, parseISO, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { TimeSlot } from '@/types'
import SlotCard from './SlotCard'

interface WeekViewProps {
  slots: TimeSlot[]
  selectedDate: Date
  onSlotSelect?: (slot: TimeSlot) => void
}

export default function WeekView({ slots, selectedDate, onSlotSelect }: WeekViewProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="grid grid-cols-7 gap-3">
      {days.map((day) => {
        const daySlots = slots.filter((slot) => isSameDay(parseISO(slot.starts_at), day))

        return (
          <div key={day.toISOString()} className="flex flex-col gap-2">
            <div className="text-center">
              <div className="text-xs font-medium uppercase text-text-muted">
                {format(day, 'EEE', { locale: ptBR })}
              </div>
              <div className="text-sm font-semibold text-text-primary">
                {format(day, 'd')}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {daySlots.map((slot) => (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  onClick={slot.status === 'available' ? () => onSlotSelect?.(slot) : undefined}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
