import type { UserRole, PlayerRole, SlotStatus, ScrimStatus, Server } from './enums'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Team {
  id: number
  name: string
  tag: string
  logo_url: string | null
  manager_id: number
  average_mmr: number | null
  created_at: string
  updated_at: string
}

export interface Player {
  id: number
  nickname: string
  role: PlayerRole
  mmr: number
  steam_id: string | null
  team_id: number
  created_at: string
  updated_at: string
}

export interface TimeSlot {
  id: number
  starts_at: string
  ends_at: string
  status: SlotStatus
  server: Server
  notes: string | null
  created_by_id: number
  created_at: string
  updated_at: string
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
