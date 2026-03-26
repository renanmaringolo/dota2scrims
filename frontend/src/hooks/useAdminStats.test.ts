import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { useAdminStats } from './useAdminStats'
import { server } from '@/tests/mocks/server'

const now = new Date()
const todaySlot = now.toISOString()
const tomorrowSlot = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
const yesterdaySlot = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

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

describe('useAdminStats', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/admin/scrims', () => {
        return HttpResponse.json({
          data: [
            {
              id: 1,
              status: 'scheduled',
              time_slot: { id: 10, starts_at: todaySlot, ends_at: todaySlot },
              team: { id: 2, name: 'Rock n Sports' },
              created_at: yesterdaySlot,
            },
            {
              id: 2,
              status: 'scheduled',
              time_slot: { id: 11, starts_at: tomorrowSlot, ends_at: tomorrowSlot },
              team: { id: 3, name: 'Lero Lero' },
              created_at: yesterdaySlot,
            },
            {
              id: 3,
              status: 'completed',
              time_slot: { id: 12, starts_at: yesterdaySlot, ends_at: yesterdaySlot },
              team: { id: 4, name: 'Bla Bla' },
              created_at: yesterdaySlot,
            },
          ],
          meta: { total: 3 },
        })
      }),
      http.get('/api/time_slots', () => {
        return HttpResponse.json({
          data: [
            { id: 10, starts_at: todaySlot, ends_at: todaySlot, status: 'booked' },
            { id: 11, starts_at: tomorrowSlot, ends_at: tomorrowSlot, status: 'booked' },
            { id: 13, starts_at: tomorrowSlot, ends_at: tomorrowSlot, status: 'available' },
            { id: 14, starts_at: yesterdaySlot, ends_at: yesterdaySlot, status: 'available' },
          ],
        })
      }),
    )
  })

  it('computes stats from scrims and slots data', async () => {
    const { result } = renderHook(() => useAdminStats(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.stats).toBeDefined()
    expect(result.current.stats!.totalScrims).toBe(3)
    expect(result.current.stats!.upcomingScrims).toBeGreaterThanOrEqual(1)
    expect(result.current.stats!.availableSlots).toBeGreaterThanOrEqual(1)
  })

  it('returns isLoading true while fetching', () => {
    const { result } = renderHook(() => useAdminStats(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.stats).toBeUndefined()
  })
})
