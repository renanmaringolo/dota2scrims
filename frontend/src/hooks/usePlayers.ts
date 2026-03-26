import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Player } from '@/types/models'
import type { ApiResponse } from '@/types/api'
import type { PlayerFormData } from '@/lib/validators'

export function usePlayers(teamId: number) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['teams', teamId] })
    queryClient.invalidateQueries({ queryKey: ['teams'] })
  }

  const addPlayerMutation = useMutation({
    mutationFn: async (data: PlayerFormData) => {
      const { data: res } = await api.post<ApiResponse<Player>>(
        `/teams/${teamId}/players`,
        { player: data },
      )
      return res.data
    },
    onSuccess: invalidate,
  })

  const updatePlayerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PlayerFormData> }) => {
      const { data: res } = await api.patch<ApiResponse<Player>>(
        `/teams/${teamId}/players/${id}`,
        { player: data },
      )
      return res.data
    },
    onSuccess: invalidate,
  })

  const removePlayerMutation = useMutation({
    mutationFn: async (playerId: number) => {
      await api.delete(`/teams/${teamId}/players/${playerId}`)
    },
    onSuccess: invalidate,
  })

  return {
    addPlayerMutation,
    updatePlayerMutation,
    removePlayerMutation,
  }
}
