import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { useTeamQuery } from '@/hooks/useTeams'
import { useAuthStore } from '@/stores/authStore'
import { PLAYER_ROLE_MAP } from '@/lib/constants'

interface TeamProfileProps {
  teamId: number
}

export default function TeamProfile({ teamId }: TeamProfileProps) {
  const teamQuery = useTeamQuery(teamId)
  const { user } = useAuthStore()

  if (teamQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  const team = teamQuery.data
  if (!team) return null

  const isOwner = user?.email === team.manager_email

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{team.name}</h2>
          <p className="text-text-secondary">{team.manager_name}</p>
          <p className="text-sm text-text-secondary">{team.mmr} MMR</p>
        </div>
        {isOwner && (
          <Button asChild variant="outline">
            <Link to={`/teams/${team.id}/edit`}>Editar</Link>
          </Button>
        )}
      </div>

      {team.players.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roster</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {team.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium text-text-primary">{player.nickname}</p>
                    <p className="text-sm text-text-secondary">{player.mmr} MMR</p>
                  </div>
                  <Badge variant="secondary">
                    {PLAYER_ROLE_MAP[player.role] ?? player.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
