import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { useAdminScrimsList, useAdminScrimDetail, useUpdateAdminScrim } from './useAdminScrims'
import { server } from '@/tests/mocks/server'

const scrimFixture = {
  id: 1,
  status: 'scheduled',
  time_slot: { id: 10, starts_at: '2026-03-27T20:00:00Z', ends_at: '2026-03-27T22:00:00Z', status: 'booked' },
  team: { id: 2, name: 'Rock n Sports', mmr: 4500 },
  lobby_name: 'avalanche-vs-rns',
  lobby_password: 'scrim123',
  server_host: 'br',
  created_at: '2026-03-26T10:00:00Z',
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

describe('useAdminScrims', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/admin/scrims', ({ request }) => {
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        const scrims = status
          ? [scrimFixture].filter((s) => s.status === status)
          : [scrimFixture]
        return HttpResponse.json({ data: scrims, meta: { total: scrims.length } })
      }),
      http.get('/api/admin/scrims/:id', ({ params }) => {
        return HttpResponse.json({ data: { ...scrimFixture, id: Number(params.id) } })
      }),
      http.patch('/api/admin/scrims/:id', async ({ request, params }) => {
        const body = (await request.json()) as { scrim: Record<string, unknown> }
        return HttpResponse.json({
          data: { ...scrimFixture, id: Number(params.id), ...body.scrim },
        })
      }),
    )
  })

  describe('useAdminScrimsList', () => {
    it('fetches all scrims without filter', async () => {
      const { result } = renderHook(() => useAdminScrimsList(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toHaveLength(1)
      expect(result.current.data![0].team.name).toBe('Rock n Sports')
    })

    it('fetches scrims filtered by status', async () => {
      const { result } = renderHook(() => useAdminScrimsList('scheduled'), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toHaveLength(1)
      expect(result.current.data![0].status).toBe('scheduled')
    })
  })

  describe('useAdminScrimDetail', () => {
    it('fetches a single scrim by id', async () => {
      const { result } = renderHook(() => useAdminScrimDetail(1), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toMatchObject({
        id: 1,
        status: 'scheduled',
        team: { name: 'Rock n Sports' },
      })
    })

    it('does not fetch when id is undefined', async () => {
      const { result } = renderHook(() => useAdminScrimDetail(undefined as unknown as number), { wrapper: createWrapper() })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useUpdateAdminScrim', () => {
    it('updates a scrim via admin endpoint', async () => {
      const { result } = renderHook(() => useUpdateAdminScrim(), { wrapper: createWrapper() })

      let updated: unknown
      await act(async () => {
        updated = await result.current.mutateAsync({
          id: 1,
          scrim: { lobby_name: 'new-lobby' },
        })
      })

      expect(updated).toMatchObject({
        id: 1,
        lobby_name: 'new-lobby',
      })
    })
  })
})
