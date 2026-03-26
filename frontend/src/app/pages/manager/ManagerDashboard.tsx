import { Link } from 'react-router-dom'
import { Swords } from 'lucide-react'
import ManagerScrimList from '@/components/manager/ManagerScrimList'
import TeamList from '@/components/team/TeamList'

export default function ManagerDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <Swords className="size-5 text-primary-400" />
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Minhas Scrims</h2>
          </div>
          <Link
            to="/teams"
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            Meus Times →
          </Link>
        </div>
        <p className="text-sm text-text-muted ml-8">Histórico de agendamentos</p>
      </div>

      <ManagerScrimList />

      <div className="border-t border-surface pt-8">
        <TeamList />
      </div>
    </div>
  )
}
