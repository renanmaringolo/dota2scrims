import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { usePlayers } from './usePlayers'
import { server } from '@/tests/mocks/server'

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

describe('usePlayers', () => {
  beforeEach(() => {
    server.use(
      http.post('/api/teams/1/players', async ({ request }) => {
        const body = (await request.json()) as { player: Record<string, unknown> }
        return HttpResponse.json(
          {
            data: {
              id: 10,
              nickname: body.player.nickname,
              role: body.player.role,
              mmr: body.player.mmr,
              team_id: 1,
              created_at: '2026-03-26T10:00:00Z',
            },
          },
          { status: 201 },
        )
      }),
      http.patch('/api/teams/1/players/10', async ({ request }) => {
        const body = (await request.json()) as { player: Record<string, unknown> }
        return HttpResponse.json({
          data: {
            id: 10,
            nickname: body.player.nickname ?? 'Lero Lero',
            role: body.player.role ?? 'hard_carry',
            mmr: body.player.mmr ?? 4200,
            team_id: 1,
            created_at: '2026-03-26T10:00:00Z',
          },
        })
      }),
      http.delete('/api/teams/1/players/10', () => {
        return new HttpResponse(null, { status: 204 })
      }),
    )
  })

  describe('addPlayerMutation', () => {
    it('creates a player and returns data', async () => {
      const { result } = renderHook(() => usePlayers(1), { wrapper: createWrapper() })

      let created: unknown
      await act(async () => {
        created = await result.current.addPlayerMutation.mutateAsync({
          nickname: 'Lero Lero',
          role: 'hard_carry',
          mmr: 4200,
        })
      })

      expect(created).toMatchObject({
        id: 10,
        nickname: 'Lero Lero',
        role: 'hard_carry',
        mmr: 4200,
        team_id: 1,
      })
    })
  })

  describe('updatePlayerMutation', () => {
    it('updates a player and returns data', async () => {
      const { result } = renderHook(() => usePlayers(1), { wrapper: createWrapper() })

      let updated: unknown
      await act(async () => {
        updated = await result.current.updatePlayerMutation.mutateAsync({
          id: 10,
          data: { nickname: 'Bla Bla', mmr: 5000 },
        })
      })

      expect(updated).toMatchObject({
        id: 10,
        nickname: 'Bla Bla',
        mmr: 5000,
        team_id: 1,
      })
    })
  })

  describe('removePlayerMutation', () => {
    it('removes a player returning void', async () => {
      const { result } = renderHook(() => usePlayers(1), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.removePlayerMutation.mutateAsync(10)
      })

      expect(result.current.removePlayerMutation.isSuccess).toBe(true)
    })
  })
})
