import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ApiResponse, Scrim, TimeSlot } from '@/types'

export interface AdminStats {
  scrimsToday: number
  upcomingScrims: number
  availableSlots: number
  totalScrims: number
}

function computeStats(scrims: Scrim[], slots: TimeSlot[]): AdminStats {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  const scrimsToday = scrims.filter((s) => {
    const startsAt = new Date(s.time_slot.starts_at)
    return startsAt >= todayStart && startsAt < todayEnd
  }).length

  const upcomingScrims = scrims.filter((s) => {
    return s.status === 'scheduled' && new Date(s.time_slot.starts_at) > now
  }).length

  const availableSlots = slots.filter((s) => {
    return s.status === 'available' && new Date(s.starts_at) > now
  }).length

  return {
    scrimsToday,
    upcomingScrims,
    availableSlots,
    totalScrims: scrims.length,
  }
}

export function useAdminStats() {
  const scrimsQuery = useQuery({
    queryKey: ['admin-scrims', { status: undefined }],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Scrim[]>>('/admin/scrims')
      return data.data
    },
    staleTime: 30 * 1000,
  })

  const slotsQuery = useQuery({
    queryKey: ['admin-stats-slots'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TimeSlot[]>>('/time_slots')
      return data.data
    },
    staleTime: 30 * 1000,
  })

  const isLoading = scrimsQuery.isLoading || slotsQuery.isLoading
  const stats = scrimsQuery.data && slotsQuery.data
    ? computeStats(scrimsQuery.data, slotsQuery.data)
    : undefined

  return {
    stats,
    isLoading,
    scrimsQuery,
    slotsQuery,
  }
}
