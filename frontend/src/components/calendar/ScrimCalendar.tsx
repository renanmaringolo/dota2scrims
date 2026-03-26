import { useMemo } from 'react'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { useCalendarStore } from '@/stores/calendarStore'
import { useTimeSlots } from '@/hooks/useTimeSlots'
import CalendarHeader from './CalendarHeader'
import WeekView from './WeekView'
import DayView from './DayView'
import SkeletonCalendar from './SkeletonCalendar'
import EmptyState from '@/components/shared/EmptyState'
import useIsMobile from '@/hooks/useIsMobile'

export default function ScrimCalendar() {
  const { selectedDate, viewMode, setViewMode, nextWeek, prevWeek, today } =
    useCalendarStore()

  const isMobile = useIsMobile()
  const effectiveViewMode = isMobile ? 'day' : viewMode

  const { dateFrom, dateTo } = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
    return {
      dateFrom: format(weekStart, 'yyyy-MM-dd'),
      dateTo: format(weekEnd, 'yyyy-MM-dd'),
    }
  }, [selectedDate])

  const { data: slots, isLoading, isError } = useTimeSlots(dateFrom, dateTo)

  return (
    <div className="space-y-4">
      <CalendarHeader
        selectedDate={selectedDate}
        viewMode={effectiveViewMode}
        onPrev={prevWeek}
        onNext={nextWeek}
        onToday={today}
        onViewModeChange={setViewMode}
        hideViewToggle={isMobile}
      />

      {isLoading && <SkeletonCalendar viewMode={effectiveViewMode} />}

      {isError && (
        <EmptyState
          title="Erro ao carregar"
          description="Não foi possível carregar os horários. Tente novamente."
        />
      )}

      {!isLoading && !isError && slots && slots.length === 0 && (
        <EmptyState
          title="Sem slots na semana"
          description="Nenhum horário disponível nesta semana."
        />
      )}

      {!isLoading && !isError && slots && slots.length > 0 && (
        effectiveViewMode === 'week' ? (
          <WeekView slots={slots} selectedDate={selectedDate} />
        ) : (
          <DayView slots={slots} selectedDate={selectedDate} />
        )
      )}
    </div>
  )
}
