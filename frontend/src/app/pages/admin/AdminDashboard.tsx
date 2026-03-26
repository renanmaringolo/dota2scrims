import { Link } from 'react-router-dom'
import { LayoutDashboard, Clock, Swords, CalendarPlus, Calendar, Trophy, type LucideIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useAdminStats, type AdminStats } from '@/hooks/useAdminStats'
import { useAdminScrimsList } from '@/hooks/useAdminScrims'
import { SERVER_LABEL_MAP } from '@/lib/constants'

interface StatCardConfig {
  label: string
  key: keyof AdminStats
  icon: LucideIcon
  color: string
  bg: string
  border: string
}

const statCards: StatCardConfig[] = [
  { label: 'Scrims Hoje', key: 'scrimsToday', icon: Swords, color: 'text-accent-gold', bg: 'bg-accent-gold/10', border: 'border-accent-gold/20' },
  { label: 'Proximas Scrims', key: 'upcomingScrims', icon: Trophy, color: 'text-primary-400', bg: 'bg-primary-400/10', border: 'border-primary-400/20' },
  { label: 'Slots Disponiveis', key: 'availableSlots', icon: Clock, color: 'text-success-400', bg: 'bg-success-400/10', border: 'border-success-400/20' },
  { label: 'Total de Scrims', key: 'totalScrims', icon: Calendar, color: 'text-info-400', bg: 'bg-info-400/10', border: 'border-info-400/20' },
]

function StatCardSkeleton() {
  return (
    <div data-testid="stat-skeleton" className="flex items-center gap-4 rounded-xl border border-border bg-bg-secondary/50 p-5">
      <Skeleton className="size-11 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-12" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { stats, isLoading } = useAdminStats()
  const { data: scrims } = useAdminScrimsList()

  const upcomingScrims = scrims
    ?.filter((s) => s.status === 'scheduled' && new Date(s.time_slot.starts_at) > new Date())
    .sort((a, b) => new Date(a.time_slot.starts_at).getTime() - new Date(b.time_slot.starts_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <LayoutDashboard className="size-5 text-primary-400" />
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Dashboard</h2>
        </div>
        <p className="text-sm text-text-muted ml-8">Painel administrativo da Avalanche eSports</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? statCards.map((card) => <StatCardSkeleton key={card.key} />)
          : statCards.map((card) => (
              <div
                key={card.key}
                className={`flex items-center gap-4 rounded-xl border ${card.border} bg-bg-secondary/50 p-5 transition-all hover:bg-bg-secondary`}
              >
                <div className={`flex size-11 items-center justify-center rounded-lg ${card.bg}`}>
                  <card.icon className={`size-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">{stats?.[card.key] ?? '--'}</p>
                  <p className="text-xs text-text-muted">{card.label}</p>
                </div>
              </div>
            ))
        }
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-bg-secondary/30 p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Proximas Partidas</h3>
          {upcomingScrims && upcomingScrims.length > 0 ? (
            <div className="space-y-3">
              {upcomingScrims.map((scrim) => (
                <div
                  key={scrim.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-bg-secondary/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Swords className="size-4 text-primary-400" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{scrim.team.name}</p>
                      <p className="text-xs text-text-muted">
                        {format(new Date(scrim.time_slot.starts_at), "dd MMM, HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  {scrim.server_host && (
                    <span className="text-xs text-text-muted">
                      {SERVER_LABEL_MAP[scrim.server_host] ?? scrim.server_host}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">Nenhuma scrim agendada</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-bg-secondary/30 p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Acoes Rapidas</h3>
          <div className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/admin/slots?action=create">
                <CalendarPlus className="size-4" />
                Criar Slot
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/admin/slots">
                <Clock className="size-4" />
                Ver Slots
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/admin/scrims">
                <Swords className="size-4" />
                Ver Scrims
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
