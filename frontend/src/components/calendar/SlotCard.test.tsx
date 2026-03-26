import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { format, parseISO } from 'date-fns'
import SlotCard from './SlotCard'
import type { TimeSlot } from '@/types'

const availableSlot: TimeSlot = {
  id: 1,
  starts_at: '2026-03-16T19:00:00Z',
  ends_at: '2026-03-16T20:30:00Z',
  status: 'available',
}

const bookedSlot: TimeSlot = {
  id: 2,
  starts_at: '2026-03-16T21:00:00Z',
  ends_at: '2026-03-16T22:30:00Z',
  status: 'booked',
  scrim: { id: 1, team: { id: 1, name: 'Rock n Sports' } },
}

const cancelledSlot: TimeSlot = {
  id: 3,
  starts_at: '2026-03-16T23:00:00Z',
  ends_at: '2026-03-17T00:30:00Z',
  status: 'cancelled',
}

const expectedStartTime = format(parseISO(availableSlot.starts_at), 'HH:mm')

describe('SlotCard', () => {
  it('renders available slot with time and badge', () => {
    render(<SlotCard slot={availableSlot} />)

    expect(screen.getByText('Disponível')).toBeInTheDocument()
    expect(screen.getByText(new RegExp(expectedStartTime))).toBeInTheDocument()
  })

  it('renders booked slot with badge', () => {
    render(<SlotCard slot={bookedSlot} />)

    expect(screen.getByText('Indisponível')).toBeInTheDocument()
  })

  it('renders cancelled slot with badge', () => {
    render(<SlotCard slot={cancelledSlot} />)

    expect(screen.getByText('Cancelado')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<SlotCard slot={availableSlot} onClick={onClick} />)

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('has accessible aria-label when clickable', () => {
    render(<SlotCard slot={availableSlot} onClick={vi.fn()} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', expect.stringContaining(expectedStartTime))
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('available'))
  })

  it('renders as div when no onClick', () => {
    render(<SlotCard slot={availableSlot} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
