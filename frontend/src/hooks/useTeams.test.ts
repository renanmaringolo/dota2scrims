import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { useTeams, useTeamQuery } from './useTeams'
import { server } from '@/tests/mocks/server'

const mockTeamsList = [
  {
    id: 1,
    name: 'Avalanche eSports',
    mmr: 5500,
    players_count: 5,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Rock n Sports',
    mmr: 0,
    players_count: 0,
    created_at: '2026-01-02T00:00:00Z',
  },
]

const mockTeamDetail = {
  id: 1,
  name: 'Avalanche eSports',
  manager_name: 'Renan Proenca',
  manager_email: 'renan@avalanche.gg',
  timezone: 'America/Sao_Paulo',
  mmr: 5500,
  players: [
    {
      id: 1,
      nickname: 'Metallica',
      role: 'hard_carry',
      mmr: 6000,
      team_id: 1,
      created_at: '2026-01-01T00:00:00Z',
    },
  ],
  created_at: '2026-01-01T00:00:00Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useTeams', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/teams', () => {
        return HttpResponse.json({ data: mockTeamsList, meta: { total: 2 } })
      }),
      http.get('/api/teams/1', () => {
        return HttpResponse.json({ data: mockTeamDetail })
      }),
      http.post('/api/teams', async ({ request }) => {
        const body = (await request.json()) as { team: Record<string, unknown> }
        return HttpResponse.json(
          {
            data: {
              id: 3,
              ...body.team,
              mmr: 0,
              players: [],
              created_at: '2026-01-03T00:00:00Z',
            },
          },
          { status: 201 },
        )
      }),
      http.patch('/api/teams/1', async ({ request }) => {
        const body = (await request.json()) as { team: Record<string, unknown> }
        return HttpResponse.json({
          data: { ...mockTeamDetail, ...body.team },
        })
      }),
      http.delete('/api/teams/1', () => {
        return new HttpResponse(null, { status: 204 })
      }),
    )
  })

  describe('teamsQuery', () => {
    it('fetches list of teams', async () => {
      const { result } = renderHook(() => useTeams(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.teamsQuery.isSuccess).toBe(true)
      })

      expect(result.current.teamsQuery.data).toHaveLength(2)
      expect(result.current.teamsQuery.data![0].name).toBe('Avalanche eSports')
      expect(result.current.teamsQuery.data![0].mmr).toBe(5500)
      expect(result.current.teamsQuery.data![0].players_count).toBe(5)
    })
  })

  describe('useTeamQuery', () => {
    it('fetches a single team by id', async () => {
      const { result } = renderHook(
        () => useTeamQuery(1),
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.name).toBe('Avalanche eSports')
      expect(result.current.data?.manager_email).toBe('renan@avalanche.gg')
      expect(result.current.data?.players).toHaveLength(1)
    })
  })

  describe('createTeamMutation', () => {
    it('creates a team and returns data', async () => {
      const { result } = renderHook(() => useTeams(), { wrapper: createWrapper() })

      let created: unknown
      await act(async () => {
        created = await result.current.createTeamMutation.mutateAsync({
          name: 'Lero Lero Team',
          manager_name: 'Lero Lero',
          manager_email: 'lero@test.com',
          timezone: 'America/Sao_Paulo',
        })
      })

      expect(created).toMatchObject({
        id: 3,
        name: 'Lero Lero Team',
        manager_name: 'Lero Lero',
      })
    })
  })

  describe('updateTeamMutation', () => {
    it('updates a team', async () => {
      const { result } = renderHook(() => useTeams(), { wrapper: createWrapper() })

      await act(async () => {
        const response = await result.current.updateTeamMutation.mutateAsync({
          id: 1,
          data: { name: 'Avalanche Updated' },
        })
        expect(response.name).toBe('Avalanche Updated')
      })

      expect(result.current.updateTeamMutation.isSuccess).toBe(true)
    })
  })

  describe('deleteTeamMutation', () => {
    it('deletes a team', async () => {
      const { result } = renderHook(() => useTeams(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.deleteTeamMutation.mutateAsync(1)
      })

      expect(result.current.deleteTeamMutation.isSuccess).toBe(true)
    })
  })
})
