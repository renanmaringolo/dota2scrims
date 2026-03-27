import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DayView from './DayView'
import type { TimeSlot } from '@/types'

const slots: TimeSlot[] = [
  { id: 1, starts_at: '2026-03-27T18:00:00', ends_at: '2026-03-27T20:00:00', status: 'available' },
  { id: 2, starts_at: '2026-03-27T20:00:00', ends_at: '2026-03-27T22:00:00', status: 'available' },
  { id: 3, starts_at: '2026-03-27T22:00:00', ends_at: '2026-03-28T00:00:00', status: 'booked' },
]

const selectedDate = new Date(2026, 2, 27)

describe('DayView', () => {
  it('renders slot list with role="list"', () => {
    render(<DayView slots={slots} selectedDate={selectedDate} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('allows arrow key navigation between available slots', async () => {
    const user = userEvent.setup()
    const onSlotSelect = vi.fn()
    render(<DayView slots={slots} selectedDate={selectedDate} onSlotSelect={onSlotSelect} />)

    const buttons = screen.getAllByRole('button')
    buttons[0].focus()
    expect(buttons[0]).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    expect(buttons[1]).toHaveFocus()
  })

  it('activates slot on Enter key', async () => {
    const user = userEvent.setup()
    const onSlotSelect = vi.fn()
    render(<DayView slots={slots} selectedDate={selectedDate} onSlotSelect={onSlotSelect} />)

    const buttons = screen.getAllByRole('button')
    buttons[0].focus()
    await user.keyboard('{Enter}')
    expect(onSlotSelect).toHaveBeenCalledWith(slots[0])
  })

  it('activates slot on Space key', async () => {
    const user = userEvent.setup()
    const onSlotSelect = vi.fn()
    render(<DayView slots={slots} selectedDate={selectedDate} onSlotSelect={onSlotSelect} />)

    const buttons = screen.getAllByRole('button')
    buttons[0].focus()
    await user.keyboard(' ')
    expect(onSlotSelect).toHaveBeenCalledWith(slots[0])
  })
})
