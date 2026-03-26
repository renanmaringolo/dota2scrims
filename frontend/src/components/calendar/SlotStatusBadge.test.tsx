import { render, screen } from '@testing-library/react'
import SlotStatusBadge from './SlotStatusBadge'

describe('SlotStatusBadge', () => {
  it('renders available badge', () => {
    render(<SlotStatusBadge status="available" />)
    expect(screen.getByText('Disponível')).toBeInTheDocument()
  })

  it('renders booked badge', () => {
    render(<SlotStatusBadge status="booked" />)
    expect(screen.getByText('Indisponível')).toBeInTheDocument()
  })

  it('renders cancelled badge', () => {
    render(<SlotStatusBadge status="cancelled" />)
    expect(screen.getByText('Cancelado')).toBeInTheDocument()
  })
})
