import { LayoutDashboard, Clock, Swords, Users } from 'lucide-react'

const stats = [
  { label: 'Slots esta semana', value: '--', icon: Clock, color: 'text-primary-400', bg: 'bg-primary-400/10', border: 'border-primary-400/20' },
  { label: 'Scrims agendados', value: '--', icon: Swords, color: 'text-accent-gold', bg: 'bg-accent-gold/10', border: 'border-accent-gold/20' },
  { label: 'Times registrados', value: '--', icon: Users, color: 'text-success-400', bg: 'bg-success-400/10', border: 'border-success-400/20' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <LayoutDashboard className="size-5 text-primary-400" />
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">Dashboard</h2>
        </div>
        <p className="text-sm text-text-muted ml-8">Painel administrativo da Avalanche eSports</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`flex items-center gap-4 rounded-xl border ${stat.border} bg-bg-secondary/50 p-5 transition-all hover:bg-bg-secondary`}
          >
            <div className={`flex size-11 items-center justify-center rounded-lg ${stat.bg}`}>
              <stat.icon className={`size-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border-bright bg-bg-secondary/30 p-8 text-center">
        <p className="text-sm text-text-muted">
          Funcionalidades do dashboard serao implementadas no CARD-014
        </p>
      </div>
    </div>
  )
}
