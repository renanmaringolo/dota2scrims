import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ApiResponse, TimeSlot } from '@/types'

export function useTimeSlots(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ['time-slots', { dateFrom, dateTo }],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TimeSlot[]>>('/time_slots', {
        params: { date_from: dateFrom, date_to: dateTo },
      })
      return data.data
    },
    staleTime: 30 * 1000,
  })
}
