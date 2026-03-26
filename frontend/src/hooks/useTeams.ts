import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Team, TeamListItem } from '@/types/models'
import type { ApiResponse } from '@/types/api'
import type { TeamFormData } from '@/lib/validators'

interface UpdateTeamParams {
  id: number
  data: Partial<TeamFormData>
}

export function useTeams() {
  const queryClient = useQueryClient()

  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TeamListItem[]>>('/teams')
      return data.data
    },
  })

  const createTeamMutation = useMutation({
    mutationFn: async (params: TeamFormData) => {
      const { data } = await api.post<ApiResponse<Team>>('/teams', { team: params })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, data: teamData }: UpdateTeamParams) => {
      const { data } = await api.patch<ApiResponse<Team>>(`/teams/${id}`, { team: teamData })
      return data.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['teams', variables.id] })
    },
  })

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/teams/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  return {
    teamsQuery,
    createTeamMutation,
    updateTeamMutation,
    deleteTeamMutation,
  }
}

export function useTeamQuery(id: number) {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Team>>(`/teams/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}
