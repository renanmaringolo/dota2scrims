import { useState, useMemo } from 'react'
import {
  eachDayOfInterval,
  getDay,
  format,
  parseISO,
} from 'date-fns'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useBulkCreateSlots } from '@/hooks/useAdminSlots'

interface BulkSlotCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const WEEKDAYS = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sab' },
  { value: 0, label: 'Dom' },
] as const

interface TimeEntry {
  start: string
  end: string
}

export default function BulkSlotCreator({ open, onOpenChange }: BulkSlotCreatorProps) {
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set())
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [timeStart, setTimeStart] = useState('19:00')
  const [timeEnd, setTimeEnd] = useState('20:00')
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])

  const bulkCreate = useBulkCreateSlots()

  function toggleDay(day: number) {
    setSelectedDays((prev) => {
      const next = new Set(prev)
      if (next.has(day)) {
        next.delete(day)
      } else {
        next.add(day)
      }
      return next
    })
  }

  function addTimeEntry() {
    if (!timeStart || !timeEnd) return
    setTimeEntries((prev) => [...prev, { start: timeStart, end: timeEnd }])
    setTimeStart('19:00')
    setTimeEnd('20:00')
  }

  function removeTimeEntry(index: number) {
    setTimeEntries((prev) => prev.filter((_, i) => i !== index))
  }

  const previewSlots = useMemo(() => {
    if (selectedDays.size === 0 || !dateFrom || !dateTo || timeEntries.length === 0) return []

    try {
      const days = eachDayOfInterval({
        start: parseISO(dateFrom),
        end: parseISO(dateTo),
      })

      const matchingDays = days.filter((d) => selectedDays.has(getDay(d)))

      return matchingDays.flatMap((day) =>
        timeEntries.map((time) => ({
          date: format(day, 'yyyy-MM-dd'),
          starts_at: `${format(day, 'yyyy-MM-dd')}T${time.start}:00.000Z`,
          ends_at: `${format(day, 'yyyy-MM-dd')}T${time.end}:00.000Z`,
          label: `${format(day, 'dd/MM')} ${time.start} - ${time.end}`,
        })),
      )
    } catch {
      return []
    }
  }, [selectedDays, dateFrom, dateTo, timeEntries])

  async function handleSubmit() {
    if (previewSlots.length === 0) return
    try {
      await bulkCreate.mutateAsync(
        previewSlots.map((s) => ({
          starts_at: s.starts_at,
          ends_at: s.ends_at,
        })),
      )
      toast.success(`${previewSlots.length} slots criados com sucesso`)
      resetForm()
      onOpenChange(false)
    } catch {
      toast.error('Erro ao criar slots em lote')
    }
  }

  function resetForm() {
    setSelectedDays(new Set())
    setDateFrom('')
    setDateTo('')
    setTimeEntries([])
    setTimeStart('19:00')
    setTimeEnd('20:00')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Slots em Lote</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Dias da semana</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDay(day.value)}
                  className={
                    selectedDays.has(day.value)
                      ? 'bg-primary-400/15 text-primary-400 border-primary-400/30'
                      : ''
                  }
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-date-from">Data inicio</Label>
              <Input
                id="bulk-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-date-to">Data fim</Label>
              <Input
                id="bulk-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Horarios</Label>
            <div className="flex items-end gap-2">
              <div className="space-y-1 flex-1">
                <Label htmlFor="bulk-time-start" className="text-xs text-text-muted">
                  Hora inicio
                </Label>
                <Input
                  id="bulk-time-start"
                  type="time"
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label htmlFor="bulk-time-end" className="text-xs text-text-muted">
                  Hora fim
                </Label>
                <Input
                  id="bulk-time-end"
                  type="time"
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addTimeEntry}
                aria-label="Adicionar horario"
                className="shrink-0"
              >
                <Plus className="size-4" />
              </Button>
            </div>

            {timeEntries.length > 0 && (
              <div className="space-y-1 mt-2">
                {timeEntries.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-1.5 text-sm"
                  >
                    <span>{entry.start} - {entry.end}</span>
                    <button
                      onClick={() => removeTimeEntry(index)}
                      aria-label="Remover"
                      className="text-text-muted hover:text-danger-400 transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {previewSlots.length > 0 && (
            <div className="space-y-2">
              <Label>Preview ({previewSlots.length} slots)</Label>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-bg-primary/50 p-2 space-y-1">
                {previewSlots.map((slot, index) => (
                  <div key={index} className="text-xs text-text-muted px-2 py-1">
                    {slot.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={previewSlots.length === 0 || bulkCreate.isPending}
          >
            {bulkCreate.isPending
              ? 'Criando...'
              : `Criar ${previewSlots.length} slot${previewSlots.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
