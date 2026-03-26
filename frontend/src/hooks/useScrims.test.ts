import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { useScrims } from './useScrims'
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

describe('useScrims', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/scrims', () => {
        return HttpResponse.json({
          data: [
            {
              id: 1,
              status: 'scheduled',
              time_slot: { id: 10, starts_at: '2026-03-27T20:00:00Z', ends_at: '2026-03-27T22:00:00Z', status: 'booked' },
              team: { id: 2, name: 'Rock n Sports', mmr: 4500 },
              lobby_name: 'avalanche-vs-rns',
              lobby_password: 'scrim123',
              server_host: 'brazil',
              created_at: '2026-03-26T10:00:00Z',
            },
          ],
          meta: { total: 1 },
        })
      }),
      http.post('/api/scrims', async ({ request }) => {
        const body = (await request.json()) as { scrim: Record<string, unknown> }
        return HttpResponse.json(
          {
            data: {
              id: 2,
              status: 'scheduled',
              time_slot: { id: body.scrim.time_slot_id, starts_at: '2026-03-28T20:00:00Z', ends_at: '2026-03-28T22:00:00Z', status: 'booked' },
              team: { id: body.scrim.team_id, name: 'Lero Lero Team', mmr: 4000 },
              lobby_name: body.scrim.lobby_name,
              lobby_password: body.scrim.lobby_password,
              server_host: body.scrim.server_host,
              created_at: '2026-03-26T12:00:00Z',
            },
          },
          { status: 201 },
        )
      }),
      http.post('/api/scrims/:id/cancel', async ({ request, params }) => {
        const body = (await request.json()) as { reason: string }
        return HttpResponse.json({
          data: {
            id: Number(params.id),
            status: 'cancelled',
            time_slot: { id: 10, starts_at: '2026-03-27T20:00:00Z', ends_at: '2026-03-27T22:00:00Z', status: 'available' },
            team: { id: 2, name: 'Rock n Sports', mmr: 4500 },
            cancellation_reason: body.reason,
            cancelled_at: '2026-03-26T15:00:00Z',
            created_at: '2026-03-26T10:00:00Z',
          },
        })
      }),
    )
  })

  describe('managerScrimsQuery', () => {
    it('fetches list of scrims', async () => {
      const { result } = renderHook(() => useScrims(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.managerScrimsQuery.isSuccess).toBe(true)
      })

      expect(result.current.managerScrimsQuery.data).toHaveLength(1)
      expect(result.current.managerScrimsQuery.data![0].team.name).toBe('Rock n Sports')
      expect(result.current.managerScrimsQuery.data![0].lobby_name).toBe('avalanche-vs-rns')
      expect(result.current.managerScrimsQuery.data![0].status).toBe('scheduled')
    })
  })

  describe('createScrimMutation', () => {
    it('creates a scrim and returns data', async () => {
      const { result } = renderHook(() => useScrims(), { wrapper: createWrapper() })

      let created: unknown
      await act(async () => {
        created = await result.current.createScrimMutation.mutateAsync({
          time_slot_id: 15,
          team_id: 3,
          lobby_name: 'test-lobby',
          lobby_password: 'pass123',
          server_host: 'brazil',
        })
      })

      expect(created).toMatchObject({
        id: 2,
        status: 'scheduled',
        lobby_name: 'test-lobby',
        server_host: 'brazil',
        team: { id: 3, name: 'Lero Lero Team' },
      })
    })
  })

  describe('cancelScrimMutation', () => {
    it('cancels a scrim with reason', async () => {
      const { result } = renderHook(() => useScrims(), { wrapper: createWrapper() })

      let cancelled: unknown
      await act(async () => {
        cancelled = await result.current.cancelScrimMutation.mutateAsync({
          id: 1,
          reason: 'Time indisponivel',
        })
      })

      expect(cancelled).toMatchObject({
        id: 1,
        status: 'cancelled',
        cancellation_reason: 'Time indisponivel',
      })
    })
  })
})
