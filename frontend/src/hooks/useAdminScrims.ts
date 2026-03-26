import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ApiResponse, Scrim, ScrimDetail } from '@/types'

export function useAdminScrimsList(status?: string) {
  return useQuery({
    queryKey: ['admin-scrims', { status }],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Scrim[]>>('/admin/scrims', {
        params: status ? { status } : undefined,
      })
      return data.data
    },
    staleTime: 30 * 1000,
  })
}

export function useAdminScrimDetail(id: number) {
  return useQuery({
    queryKey: ['admin-scrims', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ScrimDetail>>(`/admin/scrims/${id}`)
      return data.data
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  })
}

export function useUpdateAdminScrim() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, scrim }: { id: number; scrim: Partial<Scrim> }) => {
      const { data } = await api.patch<ApiResponse<Scrim>>(`/admin/scrims/${id}`, { scrim })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scrims'] })
      queryClient.invalidateQueries({ queryKey: ['scrims'] })
      queryClient.invalidateQueries({ queryKey: ['time-slots'] })
    },
  })
}

export function useCancelAdminScrim() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const { data } = await api.post<ApiResponse<Scrim>>(`/scrims/${id}/cancel`, {
        cancellation_reason: reason,
      })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scrims'] })
      queryClient.invalidateQueries({ queryKey: ['scrims'] })
      queryClient.invalidateQueries({ queryKey: ['time-slots'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}
