import { format, startOfWeek, endOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
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
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-bright bg-bg-secondary/50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onPrev}
            aria-label="Semana anterior"
            className="hover:bg-primary-400/10 hover:text-primary-400"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onNext}
            aria-label="Proxima semana"
            className="hover:bg-primary-400/10 hover:text-primary-400"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToday}
          className="text-primary-400 hover:bg-primary-400/10"
        >
          Hoje
        </Button>
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-primary-400" />
          <h2 className="text-lg font-bold tracking-tight text-text-primary capitalize">
            {dateLabel}
          </h2>
        </div>
      </div>

      {!hideViewToggle && (
        <div className="flex gap-0.5 rounded-lg border border-border-bright bg-bg-primary p-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('week')}
            className={viewMode === 'week'
              ? 'bg-primary-400/15 text-primary-400 hover:bg-primary-400/20'
              : 'text-text-muted hover:text-text-primary'}
          >
            Semana
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('day')}
            className={viewMode === 'day'
              ? 'bg-primary-400/15 text-primary-400 hover:bg-primary-400/20'
              : 'text-text-muted hover:text-text-primary'}
          >
            Dia
          </Button>
        </div>
      )}
    </div>
  )
}
