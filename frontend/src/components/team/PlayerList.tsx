import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import PlayerForm from './PlayerForm'
import { PLAYER_ROLE_MAP } from '@/lib/constants'
import { usePlayers } from '@/hooks/usePlayers'
import type { Player } from '@/types/models'

interface PlayerListProps {
  teamId: number
  players: Player[]
}

export default function PlayerList({ teamId, players }: PlayerListProps) {
  const { removePlayerMutation } = usePlayers(teamId)
  const [showForm, setShowForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | undefined>()
  const [deletingPlayer, setDeletingPlayer] = useState<Player | undefined>()

  const startersCount = players.filter((p) => p.role !== 'coach').length

  const handleEdit = (player: Player) => {
    setEditingPlayer(player)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingPlayer(undefined)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingPlayer(undefined)
  }

  const handleRemove = async () => {
    if (!deletingPlayer) return
    await removePlayerMutation.mutateAsync(deletingPlayer.id)
    setDeletingPlayer(undefined)
  }

  if (players.length === 0 && !showForm) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary">Roster</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Adicionar Jogador
          </Button>
        </div>
        <p className="text-sm text-text-secondary">
          Nenhum jogador no roster. Adicione pelo menos 5 titulares para poder agendar scrims.
        </p>
        {showForm && (
          <PlayerForm
            teamId={teamId}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-text-primary">Roster</h3>
          <span className="text-xs text-text-secondary">{startersCount}/5 titulares</span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => { setEditingPlayer(undefined); setShowForm(true) }}>
          Adicionar Jogador
        </Button>
      </div>

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-lg border border-border p-3"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">{player.nickname}</span>
              <Badge variant="secondary">
                {PLAYER_ROLE_MAP[player.role] ?? player.role}
              </Badge>
              <span className="text-sm text-text-secondary">{player.mmr} MMR</span>
            </div>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => handleEdit(player)}>
                Editar
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setDeletingPlayer(player)}>
                Remover
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <PlayerForm
          teamId={teamId}
          player={editingPlayer}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      <ConfirmDialog
        open={!!deletingPlayer}
        onOpenChange={(open) => { if (!open) setDeletingPlayer(undefined) }}
        title="Remover jogador"
        description={`Tem certeza que deseja remover ${deletingPlayer?.nickname} do roster?`}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={handleRemove}
        loading={removePlayerMutation.isPending}
      />
    </div>
  )
}
