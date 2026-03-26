import type { UserRole, PlayerRole, SlotStatus, ScrimStatus } from './enums'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface TeamListItem {
  id: number
  name: string
  mmr: number
  players_count: number
  created_at: string
}

export interface Team {
  id: number
  name: string
  manager_name: string
  manager_email: string
  timezone: string
  mmr: number
  players: Player[]
  created_at: string
}

export interface Player {
  id: number
  nickname: string
  role: PlayerRole
  mmr: number
  team_id: number
  created_at: string
}

export interface TimeSlot {
  id: number
  starts_at: string
  ends_at: string
  status: SlotStatus
  scrim?: {
    id: number
    team: {
      id: number
      name: string
    }
  }
}

export interface ScrimTeam {
  id: number
  name: string
  mmr?: number
}

export interface ScrimTimeSlot {
  id: number
  starts_at: string
  ends_at: string
  status?: string
}

export interface Scrim {
  id: number
  status: ScrimStatus
  time_slot: ScrimTimeSlot
  team: ScrimTeam
  lobby_name?: string
  lobby_password?: string
  server_host?: string
  cancellation_reason?: string
  cancelled_at?: string
  created_at: string
}

export interface ScrimDetailPlayer {
  id: number
  nickname: string
  role: PlayerRole
  mmr: number
}

export interface ScrimDetailTeam extends ScrimTeam {
  manager_name?: string
  manager_email?: string
  players?: ScrimDetailPlayer[]
}

export interface ScrimDetail extends Omit<Scrim, 'team'> {
  team: ScrimDetailTeam
  notes?: string
  updated_at?: string
}
