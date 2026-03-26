import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/tests/mocks/server'
import { useTimeSlots } from './useTimeSlots'
import type { ReactNode } from 'react'
import { createElement } from 'react'

const API_BASE = '/api'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockSlots = [
  {
    id: 1,
    starts_at: '2026-03-16T19:00:00Z',
    ends_at: '2026-03-16T20:30:00Z',
    status: 'available',
  },
  {
    id: 2,
    starts_at: '2026-03-17T21:00:00Z',
    ends_at: '2026-03-17T22:30:00Z',
    status: 'booked',
    scrim: { id: 1, team: { id: 1, name: 'Rock n Sports' } },
  },
]

describe('useTimeSlots', () => {
  it('fetches time slots with correct params', async () => {
    server.use(
      http.get(`${API_BASE}/time_slots`, ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('date_from')).toBe('2026-03-16')
        expect(url.searchParams.get('date_to')).toBe('2026-03-22')
        return HttpResponse.json({ data: mockSlots })
      }),
    )

    const { result } = renderHook(
      () => useTimeSlots('2026-03-16', '2026-03-22'),
      { wrapper: createWrapper() },
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data![0].status).toBe('available')
    expect(result.current.data![1].scrim?.team.name).toBe('Rock n Sports')
  })

  it('handles error state', async () => {
    server.use(
      http.get(`${API_BASE}/time_slots`, () => {
        return HttpResponse.json(
          { error: { status: 500, status_text: 'Internal Server Error', code: 'server_error', message: 'Bla Bla' } },
          { status: 500 },
        )
      }),
    )

    const { result } = renderHook(
      () => useTimeSlots('2026-03-16', '2026-03-22'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
