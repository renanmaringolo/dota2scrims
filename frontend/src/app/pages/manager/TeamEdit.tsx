import { Link, useParams } from 'react-router-dom'
import TeamEditForm from '@/components/team/TeamEditForm'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { useTeamQuery } from '@/hooks/useTeams'

export default function TeamEdit() {
  const { id } = useParams<{ id: string }>()
  const teamQuery = useTeamQuery(Number(id))

  if (teamQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!teamQuery.data) return null

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-1">
        <nav className="text-sm text-text-secondary">
          <Link to="/dashboard" className="hover:text-text-primary">
            Dashboard
          </Link>
          {' > '}
          <Link to={`/teams/${id}`} className="hover:text-text-primary">
            {teamQuery.data.name}
          </Link>
          {' > '}
          <span className="text-text-primary">Editar</span>
        </nav>
        <h2 className="text-2xl font-bold text-text-primary">Editar Time</h2>
      </div>
      <TeamEditForm team={teamQuery.data} />
    </div>
  )
}
