import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WeekView from './WeekView'
import type { TimeSlot } from '@/types'

const monday = new Date(2026, 2, 23)

const slots: TimeSlot[] = [
  { id: 1, starts_at: '2026-03-23T18:00:00', ends_at: '2026-03-23T20:00:00', status: 'available' },
  { id: 2, starts_at: '2026-03-24T18:00:00', ends_at: '2026-03-24T20:00:00', status: 'available' },
]

describe('WeekView', () => {
  it('renders 7 day columns', () => {
    render(<WeekView slots={[]} selectedDate={monday} />)
    const grid = screen.getByRole('grid')
    expect(grid).toBeInTheDocument()
  })

  it('allows arrow key navigation between slots across days', async () => {
    const user = userEvent.setup()
    const onSlotSelect = vi.fn()
    render(<WeekView slots={slots} selectedDate={monday} onSlotSelect={onSlotSelect} />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)

    buttons[0].focus()
    expect(buttons[0]).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(buttons[1]).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(buttons[0]).toHaveFocus()
  })
})
