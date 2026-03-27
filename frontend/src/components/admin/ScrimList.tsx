import { useMemo, useState, useTransition } from 'react'
import { format, parseISO } from 'date-fns'
import { Search, Eye, Swords } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SERVER_LABEL_MAP } from '@/lib/constants'
import type { Scrim, ScrimStatus } from '@/types'

const STATUS_TABS = [
  { label: 'Todas', value: undefined },
  { label: 'Scheduled', value: 'scheduled' as const },
  { label: 'Completed', value: 'completed' as const },
  { label: 'Cancelled', value: 'cancelled' as const },
] as const

const STATUS_BADGE_STYLES: Record<ScrimStatus, string> = {
  scheduled: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  completed: 'bg-success-400/10 text-success-400 border-success-400/20',
  cancelled: 'bg-danger-400/10 text-danger-400 border-danger-400/20',
}

const STATUS_LABELS: Record<ScrimStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

interface ScrimListProps {
  scrims: Scrim[]
  statusFilter: string | undefined
  onStatusFilterChange: (status: string | undefined) => void
  onViewDetails?: (scrim: Scrim) => void
}

export default function ScrimList({
  scrims,
  statusFilter,
  onStatusFilterChange,
  onViewDetails,
}: ScrimListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [, startTransition] = useTransition()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    startTransition(() => {
      setSearchQuery(e.target.value)
    })
  }

  const filteredScrims = useMemo(() => {
    if (!searchQuery) return scrims
    const query = searchQuery.toLowerCase()
    return scrims.filter((scrim) =>
      scrim.team.name.toLowerCase().includes(query),
    )
  }, [scrims, searchQuery])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => onStatusFilterChange(tab.value)}
              aria-label={`Filtrar por ${tab.label}`}
              className={`rounded-lg px-3 py-2.5 min-h-11 sm:min-h-0 sm:py-1.5 text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-primary-400/15 text-primary-400'
                  : 'text-text-muted hover:text-text-secondary hover:bg-bg-secondary/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Buscar por time..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Buscar scrims por nome do time"
            className="pl-9"
          />
        </div>
      </div>

      {filteredScrims.length === 0 ? (
        <div className="rounded-xl border border-border-bright bg-bg-secondary/30 p-8 text-center">
          <Swords className="mx-auto mb-3 size-8 text-text-muted/50" />
          <p className="text-sm text-text-muted">Nenhuma scrim encontrada</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-xl border border-border-bright bg-bg-secondary/30 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border-bright hover:bg-transparent">
                  <TableHead className="text-text-muted">Data/Horario</TableHead>
                  <TableHead className="text-text-muted">Time</TableHead>
                  <TableHead className="text-text-muted">MMR</TableHead>
                  <TableHead className="text-text-muted">Servidor</TableHead>
                  <TableHead className="text-text-muted">Status</TableHead>
                  <TableHead className="text-text-muted text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScrims.map((scrim) => (
                  <TableRow key={scrim.id} className="border-border-bright">
                    <TableCell className="text-text-primary">
                      {format(parseISO(scrim.time_slot.starts_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-text-primary font-medium">
                      {scrim.team.name}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {scrim.team.mmr ?? '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs text-text-secondary border-border-bright">
                        {SERVER_LABEL_MAP[scrim.server_host ?? ''] ?? scrim.server_host}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${STATUS_BADGE_STYLES[scrim.status]}`}>
                        {STATUS_LABELS[scrim.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => onViewDetails?.(scrim)}
                        aria-label={`Ver detalhes da scrim contra ${scrim.team.name}`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-primary-400 hover:bg-primary-400/10 transition-colors"
                      >
                        <Eye className="size-3.5" />
                        Detalhes
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {filteredScrims.map((scrim) => (
              <div
                key={scrim.id}
                className="rounded-xl border border-border-bright bg-bg-secondary/30 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">
                    {scrim.team.name}
                  </span>
                  <Badge variant="outline" className={`text-xs ${STATUS_BADGE_STYLES[scrim.status]}`}>
                    {STATUS_LABELS[scrim.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span>{format(parseISO(scrim.time_slot.starts_at), 'dd/MM/yyyy HH:mm')}</span>
                  <Badge variant="outline" className="text-xs text-text-secondary border-border-bright">
                    {SERVER_LABEL_MAP[scrim.server_host ?? ''] ?? scrim.server_host}
                  </Badge>
                </div>
                <button
                  onClick={() => onViewDetails?.(scrim)}
                  aria-label={`Ver detalhes da scrim contra ${scrim.team.name}`}
                  className="inline-flex items-center gap-1.5 min-h-11 py-2 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <Eye className="size-3.5" />
                  Detalhes
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
