import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { useTeams } from '@/hooks/useTeams'

export default function TeamList() {
  const { teamsQuery } = useTeams()

  if (teamsQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  const teams = teamsQuery.data ?? []

  if (teams.length === 0) {
    return (
      <EmptyState
        title="Nenhum time cadastrado"
        description="Crie seu primeiro time para comecar a agendar scrims."
        action={
          <Button asChild>
            <Link to="/teams/new">Novo Time</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Seus Times</h3>
        <Button asChild size="sm">
          <Link to="/teams/new">Novo Time</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Link key={team.id} to={`/teams/${team.id}`}>
            <Card className="transition-colors hover:border-primary-500">
              <CardHeader>
                <CardTitle className="text-base">{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">
                  {team.mmr} MMR
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
