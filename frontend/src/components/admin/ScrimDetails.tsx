import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Calendar, Copy, Shield, Swords, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAdminScrimDetail, useCancelAdminScrim } from '@/hooks/useAdminScrims'
import { SERVER_LABEL_MAP, PLAYER_ROLE_MAP } from '@/lib/constants'
import type { Scrim, ScrimStatus } from '@/types'

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

interface ScrimDetailsProps {
  scrim: Scrim | null
  onClose: () => void
}

const ROLE_COLORS: Record<string, string> = {
  hard_carry: 'border-red-500/30 bg-red-500/5',
  mid_laner: 'border-yellow-500/30 bg-yellow-500/5',
  offlaner: 'border-blue-500/30 bg-blue-500/5',
  support_4: 'border-green-500/30 bg-green-500/5',
  support_5: 'border-green-500/30 bg-green-500/5',
  coach: 'border-border-bright bg-bg-secondary/20',
}

export default function ScrimDetails({ scrim, onClose }: ScrimDetailsProps) {
  const { data: detail } = useAdminScrimDetail(scrim?.id ?? 0)
  const cancelMutation = useCancelAdminScrim()
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado!')
  }

  const handleCancel = async () => {
    if (!scrim || !cancelReason.trim()) return
    try {
      await cancelMutation.mutateAsync({ id: scrim.id, reason: cancelReason })
      toast.success('Scrim cancelada com sucesso')
      setCancelReason('')
      setShowCancelForm(false)
      onClose()
    } catch {
      toast.error('Erro ao cancelar scrim')
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setShowCancelForm(false)
      setCancelReason('')
      onClose()
    }
  }

  if (!scrim) return null

  const team = detail?.team ?? scrim.team
  const lobbyName = detail?.lobby_name ?? scrim.lobby_name
  const lobbyPassword = detail?.lobby_password ?? scrim.lobby_password

  return (
    <Dialog open={!!scrim} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-primary">
            <Swords className="size-5 text-primary-400" />
            Detalhes da Scrim
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="size-4 text-text-muted" />
              <span className="text-sm text-text-primary">
                {format(parseISO(scrim.time_slot.starts_at), 'dd/MM/yyyy HH:mm')}
                {' - '}
                {format(parseISO(scrim.time_slot.ends_at), 'HH:mm')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {scrim.server_host && (
                <Badge variant="outline" className="text-xs text-text-secondary border-border-bright">
                  {SERVER_LABEL_MAP[scrim.server_host] ?? scrim.server_host}
                </Badge>
              )}
              <Badge variant="outline" className={`text-xs ${STATUS_BADGE_STYLES[scrim.status]}`}>
                {STATUS_LABELS[scrim.status]}
              </Badge>
            </div>
          </div>

          <div className="rounded-lg border border-border-bright bg-bg-secondary/30 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-primary-400" />
              <span className="font-medium text-text-primary">{team.name}</span>
              {team.mmr != null && (
                <Badge variant="outline" className="text-xs text-text-muted border-border-bright">
                  {team.mmr}
                </Badge>
              )}
            </div>
            {'manager_name' in team && team.manager_name && (
              <p className="text-sm text-text-muted ml-6">
                {team.manager_name}
              </p>
            )}
            {'manager_email' in team && team.manager_email && (
              <p className="text-sm text-text-muted ml-6">
                {team.manager_email}
              </p>
            )}
          </div>

          {'players' in team && team.players && team.players.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary-400" />
                <span className="text-sm font-medium text-text-primary">Roster</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {team.players.map((player) => (
                  <div
                    key={player.id}
                    className={`rounded-lg border px-3 py-2 flex items-center justify-between ${ROLE_COLORS[player.role] ?? ROLE_COLORS.coach}`}
                  >
                    <div>
                      <span className="text-sm text-text-primary">{player.nickname}</span>
                      <span className="ml-2 text-xs text-text-muted">
                        {PLAYER_ROLE_MAP[player.role] ?? player.role}
                      </span>
                    </div>
                    {player.role !== 'coach' && player.mmr > 0 && (
                      <span className="text-xs text-text-muted">{player.mmr}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(lobbyName || lobbyPassword) && (
            <div className="rounded-lg border border-border-bright bg-bg-secondary/30 p-4 space-y-2">
              <span className="text-sm font-medium text-text-primary">Lobby</span>
              {lobbyName && (
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-text-secondary">{lobbyName}</span>
                  <button
                    onClick={() => handleCopy(lobbyName)}
                    aria-label="Copiar lobby name"
                    className="rounded p-1 text-text-muted hover:text-primary-400 transition-colors"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              )}
              {lobbyPassword && (
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-text-secondary">{lobbyPassword}</span>
                  <button
                    onClick={() => handleCopy(lobbyPassword)}
                    aria-label="Copiar lobby password"
                    className="rounded p-1 text-text-muted hover:text-primary-400 transition-colors"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {scrim.status === 'cancelled' && scrim.cancellation_reason && (
            <div className="rounded-lg border border-danger-500/20 bg-danger-500/5 p-4 space-y-1">
              <span className="text-sm font-medium text-danger-400">Motivo do cancelamento</span>
              <p className="text-sm text-text-secondary">{scrim.cancellation_reason}</p>
              {scrim.cancelled_at && (
                <p className="text-xs text-text-muted">
                  {format(parseISO(scrim.cancelled_at), 'dd/MM/yyyy HH:mm')}
                </p>
              )}
            </div>
          )}

          {detail && 'notes' in detail && detail.notes && (
            <div className="rounded-lg border border-border-bright bg-bg-secondary/30 p-4 space-y-1">
              <span className="text-sm font-medium text-text-primary">Notas</span>
              <p className="text-sm text-text-secondary">{detail.notes}</p>
            </div>
          )}

          {scrim.status === 'scheduled' && !showCancelForm && (
            <button
              onClick={() => setShowCancelForm(true)}
              className="w-full rounded-lg border border-danger-500/30 px-4 py-2 text-sm font-medium text-danger-400 hover:bg-danger-500/10 transition-colors"
            >
              Cancelar Scrim
            </button>
          )}

          {showCancelForm && (
            <div className="rounded-lg border border-danger-500/20 bg-danger-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-danger-400">Cancelar Scrim</span>
                <button
                  onClick={() => {
                    setShowCancelForm(false)
                    setCancelReason('')
                  }}
                  className="text-text-muted hover:text-text-secondary"
                >
                  <X className="size-4" />
                </button>
              </div>
              <Input
                placeholder="Motivo do cancelamento"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <button
                onClick={handleCancel}
                disabled={!cancelReason.trim() || cancelMutation.isPending}
                className="w-full rounded-lg bg-danger-500 px-4 py-2 text-sm font-medium text-white hover:bg-danger-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelMutation.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
