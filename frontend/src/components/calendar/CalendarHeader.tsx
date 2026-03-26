import { format, startOfWeek, endOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ViewMode = 'week' | 'day'

interface CalendarHeaderProps {
  selectedDate: Date
  viewMode: ViewMode
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onViewModeChange: (mode: ViewMode) => void
  hideViewToggle?: boolean
}

export default function CalendarHeader({
  selectedDate,
  viewMode,
  onPrev,
  onNext,
  onToday,
  onViewModeChange,
  hideViewToggle,
}: CalendarHeaderProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })

  const dateLabel =
    viewMode === 'week'
      ? `${format(weekStart, 'd')} - ${format(weekEnd, 'd MMM yyyy', { locale: ptBR })}`
      : format(selectedDate, "EEEE, d MMM yyyy", { locale: ptBR })

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrev} aria-label="Semana anterior">
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNext} aria-label="Próxima semana">
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onToday}>
          Hoje
        </Button>
        <h2 className="text-lg font-semibold text-text-primary capitalize">
          {dateLabel}
        </h2>
      </div>

      {!hideViewToggle && (
        <div className="flex gap-1 rounded-lg bg-bg-tertiary p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('week')}
            data-active={viewMode === 'week'}
            className={viewMode === 'week' ? 'bg-bg-elevated' : ''}
          >
            Semana
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('day')}
            data-active={viewMode === 'day'}
            className={viewMode === 'day' ? 'bg-bg-elevated' : ''}
          >
            Dia
          </Button>
        </div>
      )}
    </div>
  )
}
