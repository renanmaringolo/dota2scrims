import { useCallback, useRef } from 'react'
import { startOfWeek, addDays, format, parseISO, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { TimeSlot } from '@/types'
import SlotCard from './SlotCard'
import { cn } from '@/lib/cn'

interface WeekViewProps {
  slots: TimeSlot[]
  selectedDate: Date
  onSlotSelect?: (slot: TimeSlot) => void
}

export default function WeekView({ slots, selectedDate, onSlotSelect }: WeekViewProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const gridRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const focusable = gridRef.current?.querySelectorAll<HTMLElement>('[data-slot-card]')
    if (!focusable?.length) return

    const items = Array.from(focusable)
    const currentIndex = items.findIndex((el) => el === document.activeElement)
    if (currentIndex === -1) return

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.min(currentIndex + 1, items.length - 1)
      items[next].focus()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = Math.max(currentIndex - 1, 0)
      items[prev].focus()
    }
  }, [])

  return (
    <div ref={gridRef} role="grid" aria-label="Calendário semanal" className="grid grid-cols-7 gap-3" onKeyDown={handleKeyDown}>
      {days.map((day) => {
        const daySlots = slots.filter((slot) => isSameDay(parseISO(slot.starts_at), day))
        const today = isToday(day)

        return (
          <div key={day.toISOString()} role="row" className="flex flex-col gap-3">
            <div className={cn(
              'flex flex-col items-center gap-0.5 rounded-lg py-2 transition-colors',
              today ? 'bg-primary-400/10' : 'bg-bg-secondary/30',
            )}>
              <div className={cn(
                'text-xs font-medium uppercase tracking-wider',
                today ? 'text-primary-400' : 'text-text-muted',
              )}>
                {format(day, 'EEE', { locale: ptBR })}
              </div>
              <div className={cn(
                'flex size-8 items-center justify-center rounded-full text-sm font-bold',
                today ? 'bg-primary-400 text-bg-primary' : 'text-text-primary',
              )}>
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
