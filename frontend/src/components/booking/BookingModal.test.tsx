import { screen } from '@testing-library/react'
import { renderWithProviders, userEvent } from '@/tests/utils'
import BookingModal from './BookingModal'
import type { TimeSlot } from '@/types/models'

beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
  Element.prototype.scrollIntoView = () => {}
})

const mockSlot: TimeSlot = {
  id: 1,
  starts_at: '2026-03-28T20:00:00Z',
  ends_at: '2026-03-28T22:00:00Z',
  status: 'available',
}

const mockOnOpenChange = vi.fn()

describe('BookingModal', () => {
  beforeEach(() => {
    mockOnOpenChange.mockClear()
  })

  it('renders dialog when open with slot info', () => {
    renderWithProviders(
      <BookingModal slot={mockSlot} open={true} onOpenChange={mockOnOpenChange} />,
    )

    expect(screen.getByRole('heading', { name: 'Agendar Scrim' })).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderWithProviders(
      <BookingModal slot={mockSlot} open={false} onOpenChange={mockOnOpenChange} />,
    )

    expect(screen.queryByRole('heading', { name: 'Agendar Scrim' })).not.toBeInTheDocument()
  })

  it('renders slot date and time in description', () => {
    renderWithProviders(
      <BookingModal slot={mockSlot} open={true} onOpenChange={mockOnOpenChange} />,
    )

    expect(screen.getByText(/28\/03\/2026/)).toBeInTheDocument()
    expect(screen.getByText(/17:00 ate 19:00|20:00 ate 22:00/)).toBeInTheDocument()
  })

  it('renders TeamSelector field inside dialog', () => {
    renderWithProviders(
      <BookingModal slot={mockSlot} open={true} onOpenChange={mockOnOpenChange} />,
    )

    expect(screen.getByText('Time Adversario')).toBeInTheDocument()
  })

  it('renders LobbyFields inside dialog', () => {
    renderWithProviders(
      <BookingModal slot={mockSlot} open={true} onOpenChange={mockOnOpenChange} />,
    )

    expect(screen.getByLabelText('Nome do Lobby')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha do Lobby')).toBeInTheDocument()
    expect(screen.getByText('Servidor')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderWithProviders(
      <BookingModal slot={mockSlot} open={true} onOpenChange={mockOnOpenChange} />,
    )

    expect(screen.getByRole('button', { name: 'Agendar Scrim' })).toBeInTheDocument()
  })

  it('calls onOpenChange when close button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <BookingModal slot={mockSlot} open={true} onOpenChange={mockOnOpenChange} />,
    )

    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
