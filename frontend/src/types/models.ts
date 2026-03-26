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

export interface Scrim {
  id: number
  time_slot_id: number
  challenger_team_id: number
  status: ScrimStatus
  result: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
