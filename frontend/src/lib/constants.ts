export const SERVERS = ['BR', 'ARG', 'WEU'] as const

export const TIMEZONES = [
  'America/Sao_Paulo',
  'America/Argentina/Buenos_Aires',
  'Europe/London',
] as const

export const PLAYER_ROLES = [
  'hard_carry',
  'mid_laner',
  'offlaner',
  'support_4',
  'support_5',
  'coach',
] as const

export const SLOT_STATUSES = ['available', 'booked', 'cancelled'] as const

export const SCRIM_STATUSES = ['scheduled', 'completed', 'cancelled'] as const

export const PLAYER_ROLE_MAP: Record<string, string> = {
  hard_carry: 'HC',
  mid_laner: 'Mid',
  offlaner: 'Off',
  support_4: 'P4',
  support_5: 'P5',
  coach: 'Coach',
}
