import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

type SubscriptionMixin = {
  connected?: () => void
  disconnected?: () => void
  received?: (message: unknown) => void
}

const mockUnsubscribe = vi.fn()
let capturedMixin: SubscriptionMixin = {}

const mockConsumer = {
  subscriptions: {
    create: vi.fn((_channel: string, mixin: SubscriptionMixin) => {
      capturedMixin = mixin
      return { unsubscribe: mockUnsubscribe, perform: vi.fn() }
    }),
  },
  disconnect: vi.fn(),
  connect: vi.fn(),
}

vi.mock('@/hooks/useCable', () => ({
  useCable: vi.fn(() => ({ consumer: mockConsumer })),
}))

import { useCalendarChannel } from './useCalendarChannel'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useCalendarChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    capturedMixin = {}
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates subscription to ScrimChannel', () => {
    renderHook(() => useCalendarChannel(), { wrapper: createWrapper() })

    expect(mockConsumer.subscriptions.create).toHaveBeenCalledWith(
      'ScrimChannel',
      expect.objectContaining({
        connected: expect.any(Function),
        disconnected: expect.any(Function),
        received: expect.any(Function),
      }),
    )
  })

  it('returns connected true after connected callback', () => {
    const { result } = renderHook(() => useCalendarChannel(), {
      wrapper: createWrapper(),
    })

    act(() => {
      capturedMixin.connected?.()
    })

    expect(result.current.connected).toBe(true)
  })

  it('invalidates queries when message is received', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    renderHook(() => useCalendarChannel(), { wrapper })

    act(() => {
      capturedMixin.received?.({
        event: 'slot_created',
        data: { id: 1, starts_at: '2026-03-26T20:00:00Z', ends_at: '2026-03-26T21:00:00Z', status: 'available' },
      })
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['time-slots'] })
  })

  it('starts polling when disconnected', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    renderHook(() => useCalendarChannel(), { wrapper })

    act(() => {
      capturedMixin.disconnected?.()
    })

    invalidateSpy.mockClear()

    act(() => {
      vi.advanceTimersByTime(30_000)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['time-slots'] })
  })

  it('stops polling when reconnected', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    renderHook(() => useCalendarChannel(), { wrapper })

    act(() => {
      capturedMixin.disconnected?.()
    })

    act(() => {
      capturedMixin.connected?.()
    })

    invalidateSpy.mockClear()

    act(() => {
      vi.advanceTimersByTime(30_000)
    })

    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useCalendarChannel(), {
      wrapper: createWrapper(),
    })

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
