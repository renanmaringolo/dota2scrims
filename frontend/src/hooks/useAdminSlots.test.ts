import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { useCreateSlot, useBulkCreateSlots, useUpdateSlot, useDeleteSlot } from './useAdminSlots'
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

describe('useAdminSlots', () => {
  beforeEach(() => {
    server.use(
      http.post('/api/admin/time_slots', async ({ request }) => {
        const body = (await request.json()) as { time_slot: { starts_at: string; ends_at: string } }
        return HttpResponse.json(
          {
            data: {
              id: 1,
              starts_at: body.time_slot.starts_at,
              ends_at: body.time_slot.ends_at,
              status: 'available',
            },
          },
          { status: 201 },
        )
      }),
      http.post('/api/admin/time_slots/bulk_create', async ({ request }) => {
        const body = (await request.json()) as { time_slots: Array<{ starts_at: string; ends_at: string }> }
        return HttpResponse.json({
          data: body.time_slots.map((slot, index) => ({
            id: index + 10,
            starts_at: slot.starts_at,
            ends_at: slot.ends_at,
            status: 'available',
          })),
        })
      }),
      http.patch('/api/admin/time_slots/:id', async ({ request, params }) => {
        const body = (await request.json()) as { time_slot: { starts_at: string; ends_at: string } }
        return HttpResponse.json({
          data: {
            id: Number(params.id),
            starts_at: body.time_slot.starts_at,
            ends_at: body.time_slot.ends_at,
            status: 'available',
          },
        })
      }),
      http.delete('/api/admin/time_slots/:id', () => {
        return new HttpResponse(null, { status: 204 })
      }),
    )
  })

  describe('useCreateSlot', () => {
    it('creates a time slot via admin endpoint', async () => {
      const { result } = renderHook(() => useCreateSlot(), { wrapper: createWrapper() })

      let created: unknown
      await act(async () => {
        created = await result.current.mutateAsync({
          starts_at: '2026-03-28T20:00:00Z',
          ends_at: '2026-03-28T22:00:00Z',
        })
      })

      expect(created).toMatchObject({
        id: 1,
        starts_at: '2026-03-28T20:00:00Z',
        ends_at: '2026-03-28T22:00:00Z',
        status: 'available',
      })
    })
  })

  describe('useBulkCreateSlots', () => {
    it('creates multiple time slots at once', async () => {
      const { result } = renderHook(() => useBulkCreateSlots(), { wrapper: createWrapper() })

      let created: unknown
      await act(async () => {
        created = await result.current.mutateAsync([
          { starts_at: '2026-03-28T20:00:00Z', ends_at: '2026-03-28T22:00:00Z' },
          { starts_at: '2026-03-29T20:00:00Z', ends_at: '2026-03-29T22:00:00Z' },
        ])
      })

      expect(created).toHaveLength(2)
      expect((created as Array<{ id: number }>)[0].id).toBe(10)
      expect((created as Array<{ id: number }>)[1].id).toBe(11)
    })
  })

  describe('useUpdateSlot', () => {
    it('updates a time slot via admin endpoint', async () => {
      const { result } = renderHook(() => useUpdateSlot(), { wrapper: createWrapper() })

      let updated: unknown
      await act(async () => {
        updated = await result.current.mutateAsync({
          id: 5,
          starts_at: '2026-03-28T21:00:00Z',
          ends_at: '2026-03-28T23:00:00Z',
        })
      })

      expect(updated).toMatchObject({
        id: 5,
        starts_at: '2026-03-28T21:00:00Z',
        ends_at: '2026-03-28T23:00:00Z',
      })
    })
  })

  describe('useDeleteSlot', () => {
    it('deletes a time slot via admin endpoint', async () => {
      const { result } = renderHook(() => useDeleteSlot(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.mutateAsync(5)
      })

      expect(result.current.isSuccess).toBe(true)
    })
  })
})
