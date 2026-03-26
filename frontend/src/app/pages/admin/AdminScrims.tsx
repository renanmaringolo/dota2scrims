import { useState } from 'react'
import { Swords } from 'lucide-react'
import { useAdminScrimsList } from '@/hooks/useAdminScrims'
import ScrimList from '@/components/admin/ScrimList'
import ScrimDetails from '@/components/admin/ScrimDetails'
import type { Scrim } from '@/types'

export default function AdminScrims() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [selectedScrim, setSelectedScrim] = useState<Scrim | null>(null)
  const { data: scrims, isLoading } = useAdminScrimsList(statusFilter)

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Swords className="size-5 text-primary-400" />
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Scrims</h2>
          {scrims && scrims.length > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary-400/15 px-2 py-0.5 text-xs font-medium text-primary-400">
              {scrims.length}
            </span>
          )}
        </div>
        <p className="text-sm text-text-muted ml-8">Visualize e gerencie todas as partidas agendadas</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-10 rounded-lg bg-bg-secondary/50 animate-pulse" />
          <div className="h-64 rounded-xl bg-bg-secondary/50 animate-pulse" />
        </div>
      ) : (
        <ScrimList
          scrims={scrims ?? []}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onViewDetails={setSelectedScrim}
        />
      )}

      <ScrimDetails
        scrim={selectedScrim}
        onClose={() => setSelectedScrim(null)}
      />
    </div>
  )
}
