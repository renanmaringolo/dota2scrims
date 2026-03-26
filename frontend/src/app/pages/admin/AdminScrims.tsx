import { Swords } from 'lucide-react'

export default function AdminScrims() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Swords className="size-5 text-primary-400" />
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Scrims</h2>
        </div>
        <p className="text-sm text-text-muted ml-8">Visualize e gerencie todas as partidas agendadas</p>
      </div>

      <div className="rounded-xl border border-border-bright bg-bg-secondary/30 p-8 text-center">
        <p className="text-sm text-text-muted">
          Gerenciamento de scrims sera implementado no CARD-014
        </p>
      </div>
    </div>
  )
}
