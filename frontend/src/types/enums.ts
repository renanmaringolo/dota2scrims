import type {
  SERVERS,
  TIMEZONES,
  PLAYER_ROLES,
  SLOT_STATUSES,
  SCRIM_STATUSES,
} from '@/lib/constants'

export type Server = (typeof SERVERS)[number]
export type Timezone = (typeof TIMEZONES)[number]
export type PlayerRole = (typeof PLAYER_ROLES)[number]
export type SlotStatus = (typeof SLOT_STATUSES)[number]
export type ScrimStatus = (typeof SCRIM_STATUSES)[number]
export type UserRole = 'admin' | 'manager'
