import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ApiResponse, TimeSlot } from '@/types'

interface SlotParams {
  starts_at: string
  ends_at: string
}

interface UpdateSlotParams extends SlotParams {
  id: number
}

export function useCreateSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: SlotParams) => {
      const { data } = await api.post<ApiResponse<TimeSlot>>('/admin/time_slots', {
        time_slot: params,
      })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] })
    },
  })
}

export function useBulkCreateSlots() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: SlotParams[]) => {
      const { data } = await api.post<ApiResponse<TimeSlot[]>>('/admin/time_slots/bulk_create', {
        time_slots: params,
      })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] })
    },
  })
}

export function useUpdateSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...params }: UpdateSlotParams) => {
      const { data } = await api.patch<ApiResponse<TimeSlot>>(`/admin/time_slots/${id}`, {
        time_slot: params,
      })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] })
    },
  })
}

export function useDeleteSlot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/time_slots/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-slots'] })
    },
  })
}
