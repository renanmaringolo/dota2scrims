import { useCallback, useRef } from 'react'
import { parseISO, isSameDay } from 'date-fns'
import type { TimeSlot } from '@/types'
import SlotCard from './SlotCard'
import EmptyState from '@/components/shared/EmptyState'

interface DayViewProps {
  slots: TimeSlot[]
  selectedDate: Date
  onSlotSelect?: (slot: TimeSlot) => void
}

export default function DayView({ slots, selectedDate, onSlotSelect }: DayViewProps) {
  const daySlots = slots.filter((slot) => isSameDay(parseISO(slot.starts_at), selectedDate))
  const listRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const focusable = listRef.current?.querySelectorAll<HTMLElement>('[data-slot-card]')
    if (!focusable?.length) return

    const items = Array.from(focusable)
    const currentIndex = items.findIndex((el) => el === document.activeElement)
    if (currentIndex === -1) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.min(currentIndex + 1, items.length - 1)
      items[next].focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = Math.max(currentIndex - 1, 0)
      items[prev].focus()
    }
  }, [])

  if (daySlots.length === 0) {
    return <EmptyState title="Sem slots" description="Nenhum horário disponível para este dia." />
  }

  return (
    <div ref={listRef} role="list" aria-label="Slots do dia" className="flex flex-col gap-3" onKeyDown={handleKeyDown}>
      {daySlots.map((slot) => (
        <SlotCard
          key={slot.id}
          slot={slot}
          onClick={slot.status === 'available' ? () => onSlotSelect?.(slot) : undefined}
        />
      ))}
    </div>
  )
}
