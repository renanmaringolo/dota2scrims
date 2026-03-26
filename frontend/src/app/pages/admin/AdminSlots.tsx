import { useState, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Clock, Plus, Layers, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
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
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import EmptyState from '@/components/shared/EmptyState'
import SlotStatusBadge from '@/components/calendar/SlotStatusBadge'
import BulkSlotCreator from '@/components/admin/BulkSlotCreator'
import { useTimeSlots } from '@/hooks/useTimeSlots'
import { useCreateSlot, useUpdateSlot, useDeleteSlot } from '@/hooks/useAdminSlots'
import type { TimeSlot, SlotStatus } from '@/types'

type StatusFilter = 'all' | SlotStatus

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'available', label: 'Disponivel' },
  { value: 'booked', label: 'Reservado' },
  { value: 'cancelled', label: 'Cancelado' },
]

function toLocalDatetime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export default function AdminSlots() {
  const [weekDate, setWeekDate] = useState(() => new Date())
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [editSlot, setEditSlot] = useState<TimeSlot | null>(null)
  const [deleteSlot, setDeleteSlot] = useState<TimeSlot | null>(null)
  const [formStartsAt, setFormStartsAt] = useState('')
  const [formEndsAt, setFormEndsAt] = useState('')

  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 })
  const dateFrom = format(weekStart, 'yyyy-MM-dd')
  const dateTo = format(weekEnd, 'yyyy-MM-dd')

  const { data: slots = [], isLoading } = useTimeSlots(dateFrom, dateTo)
  const createSlot = useCreateSlot()
  const updateSlot = useUpdateSlot()
  const deleteSlotMutation = useDeleteSlot()

  const filteredSlots = useMemo(() => {
    if (statusFilter === 'all') return slots
    return slots.filter((s) => s.status === statusFilter)
  }, [slots, statusFilter])

  const weekLabel = `${format(weekStart, 'd')} - ${format(weekEnd, 'd MMM yyyy', { locale: ptBR })}`

  function openCreate() {
    setFormStartsAt('')
    setFormEndsAt('')
    setCreateOpen(true)
  }

  function openEdit(slot: TimeSlot) {
    setFormStartsAt(toLocalDatetime(slot.starts_at))
    setFormEndsAt(toLocalDatetime(slot.ends_at))
    setEditSlot(slot)
  }

  async function handleCreate() {
    if (!formStartsAt || !formEndsAt) return
    try {
      await createSlot.mutateAsync({
        starts_at: new Date(formStartsAt).toISOString(),
        ends_at: new Date(formEndsAt).toISOString(),
      })
      toast.success('Slot criado com sucesso')
      setCreateOpen(false)
    } catch {
      toast.error('Erro ao criar slot')
    }
  }

  async function handleUpdate() {
    if (!editSlot || !formStartsAt || !formEndsAt) return
    try {
      await updateSlot.mutateAsync({
        id: editSlot.id,
        starts_at: new Date(formStartsAt).toISOString(),
        ends_at: new Date(formEndsAt).toISOString(),
      })
      toast.success('Slot atualizado com sucesso')
      setEditSlot(null)
    } catch {
      toast.error('Erro ao atualizar slot')
    }
  }

  async function handleDelete() {
    if (!deleteSlot) return
    try {
      await deleteSlotMutation.mutateAsync(deleteSlot.id)
      toast.success('Slot deletado com sucesso')
      setDeleteSlot(null)
    } catch {
      toast.error('Erro ao deletar slot')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Clock className="size-5 text-primary-400" />
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Time Slots</h2>
          </div>
          <p className="text-sm text-text-muted ml-8">Crie e gerencie horarios disponiveis para scrims</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkOpen(true)} className="gap-2">
            <Layers className="size-4" />
            Criar em Massa
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="size-4" />
            Criar Slot
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-bright bg-bg-secondary/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setWeekDate((d) => subWeeks(d, 1))}
              aria-label="Semana anterior"
              className="hover:bg-primary-400/10 hover:text-primary-400"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setWeekDate((d) => addWeeks(d, 1))}
              aria-label="Proxima semana"
              className="hover:bg-primary-400/10 hover:text-primary-400"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekDate(new Date())}
            className="text-primary-400 hover:bg-primary-400/10"
          >
            Hoje
          </Button>
          <span className="text-sm font-medium text-text-primary capitalize">{weekLabel}</span>
        </div>

        <div className="flex gap-1 rounded-lg border border-border-bright bg-bg-primary p-0.5">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter(f.value)}
              className={
                statusFilter === f.value
                  ? 'bg-primary-400/15 text-primary-400 hover:bg-primary-400/20'
                  : 'text-text-muted hover:text-text-primary'
              }
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-text-muted text-sm">Carregando...</div>
      ) : filteredSlots.length === 0 ? (
        <EmptyState
          icon={<Clock className="size-8 text-text-muted" />}
          title="Nenhum slot encontrado"
          description="Crie novos slots para a semana selecionada"
        />
      ) : (
        <>
          <div className="hidden md:block">
            <div className="rounded-xl border border-border-bright overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-bg-secondary/50 text-left text-xs text-text-muted uppercase tracking-wider">
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Horario</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3 text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSlots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-bg-elevated/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {format(new Date(slot.starts_at), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {format(new Date(slot.starts_at), 'HH:mm')} - {format(new Date(slot.ends_at), 'HH:mm')}
                      </td>
                      <td className="px-4 py-3">
                        <SlotStatusBadge status={slot.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">
                        {slot.scrim?.team?.name ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEdit(slot)}
                            aria-label="Editar"
                            className="hover:bg-primary-400/10 hover:text-primary-400"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteSlot(slot)}
                            aria-label="Excluir"
                            className="hover:bg-danger-500/10 hover:text-danger-400"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {filteredSlots.map((slot) => (
              <div
                key={slot.id}
                className="rounded-xl border border-border-bright bg-bg-secondary/30 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">
                    {format(new Date(slot.starts_at), 'dd/MM/yyyy')}
                  </span>
                  <SlotStatusBadge status={slot.status} />
                </div>
                <div className="text-sm text-text-muted">
                  {format(new Date(slot.starts_at), 'HH:mm')} - {format(new Date(slot.ends_at), 'HH:mm')}
                </div>
                {slot.scrim?.team?.name && (
                  <div className="text-sm text-text-primary">{slot.scrim.team.name}</div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(slot)}
                    aria-label="Editar"
                    className="gap-1.5"
                  >
                    <Pencil className="size-3" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteSlot(slot)}
                    aria-label="Excluir"
                    className="gap-1.5 text-danger-400 hover:bg-danger-500/10"
                  >
                    <Trash2 className="size-3" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-starts-at">Inicio</Label>
              <Input
                id="create-starts-at"
                type="datetime-local"
                value={formStartsAt}
                onChange={(e) => setFormStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-ends-at">Fim</Label>
              <Input
                id="create-ends-at"
                type="datetime-local"
                value={formEndsAt}
                onChange={(e) => setFormEndsAt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createSlot.isPending || !formStartsAt || !formEndsAt}>
              {createSlot.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editSlot} onOpenChange={(open) => !open && setEditSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-starts-at">Inicio</Label>
              <Input
                id="edit-starts-at"
                type="datetime-local"
                value={formStartsAt}
                onChange={(e) => setFormStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ends-at">Fim</Label>
              <Input
                id="edit-ends-at"
                type="datetime-local"
                value={formEndsAt}
                onChange={(e) => setFormEndsAt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSlot(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={updateSlot.isPending || !formStartsAt || !formEndsAt}>
              {updateSlot.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteSlot}
        onOpenChange={(open) => !open && setDeleteSlot(null)}
        title="Excluir Slot"
        description="Tem certeza que deseja excluir este slot? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteSlotMutation.isPending}
      />

      <BulkSlotCreator open={bulkOpen} onOpenChange={setBulkOpen} />
    </div>
  )
}
