import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSlotAnnouncer } from './useSlotAnnouncer'

describe('useSlotAnnouncer', () => {
  it('starts with empty message', () => {
    const { result } = renderHook(() => useSlotAnnouncer())
    expect(result.current.message).toBe('')
  })

  it('announces slot_created event', () => {
    const { result } = renderHook(() => useSlotAnnouncer())
    act(() => {
      result.current.announce({
        event: 'slot_created',
        data: { id: 1, starts_at: '2026-03-27T20:00:00', ends_at: '2026-03-27T22:00:00', status: 'available' },
      })
    })
    expect(result.current.message).toContain('20:00')
    expect(result.current.message).toContain('22:00')
    expect(result.current.message).toContain('disponível')
  })

  it('announces slot_booked event', () => {
    const { result } = renderHook(() => useSlotAnnouncer())
    act(() => {
      result.current.announce({
        event: 'slot_booked',
        data: { id: 1, starts_at: '2026-03-27T20:00:00', ends_at: '2026-03-27T22:00:00', status: 'booked' },
      })
    })
    expect(result.current.message).toContain('reservado')
  })

  it('announces slot_cancelled event', () => {
    const { result } = renderHook(() => useSlotAnnouncer())
    act(() => {
      result.current.announce({
        event: 'slot_cancelled',
        data: { id: 1, starts_at: '2026-03-27T20:00:00', ends_at: '2026-03-27T22:00:00', status: 'cancelled' },
      })
    })
    expect(result.current.message).toContain('cancelado')
  })
})
