import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Scrim } from '@/types/models'
import type { ApiResponse } from '@/types/api'
import type { BookingFormData } from '@/lib/validators'

export function useScrims() {
  const queryClient = useQueryClient()

  const managerScrimsQuery = useQuery({
    queryKey: ['scrims'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Scrim[]>>('/scrims')
      return data.data
    },
  })

  const createScrimMutation = useMutation({
    mutationFn: async (params: BookingFormData & { time_slot_id: number }) => {
      const { data } = await api.post<ApiResponse<Scrim>>('/scrims', { scrim: params })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrims'] })
      queryClient.invalidateQueries({ queryKey: ['time-slots'] })
    },
  })

  const cancelScrimMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const { data } = await api.post<ApiResponse<Scrim>>(`/scrims/${id}/cancel`, { reason })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrims'] })
      queryClient.invalidateQueries({ queryKey: ['time-slots'] })
    },
  })

  return {
    managerScrimsQuery,
    createScrimMutation,
    cancelScrimMutation,
  }
}
