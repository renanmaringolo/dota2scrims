import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import BookingModal from '@/components/booking/BookingModal'
import type { TimeSlot } from '@/types/models'

beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn()
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
})

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
}

const availableSlot: TimeSlot = {
  id: 10,
  starts_at: '2026-03-27T20:00:00Z',
  ends_at: '2026-03-27T22:00:00Z',
  status: 'available',
  created_by_id: 1,
}

function renderBookingModal(slot: TimeSlot | null = availableSlot, open = true) {
  const queryClient = createTestQueryClient()
  const onOpenChange = vi.fn()
  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <BookingModal open={open} onOpenChange={onOpenChange} slot={slot} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return { ...result, onOpenChange }
}

describe('Booking Flow Integration', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 2, email: 'manager@team.com', name: 'Lero Lero', role: 'manager', created_at: '', updated_at: '' },
      token: 'fake-jwt-token',
      isAuthenticated: true,
      isAdmin: false,
    })
  })

  it('renders booking modal with slot info and title', async () => {
    renderBookingModal()

    expect(screen.getByRole('heading', { name: 'Agendar Scrim' })).toBeInTheDocument()
    expect(screen.getByText(/27\/03\/2026/)).toBeInTheDocument()
  })

  it('shows team selector with fetched teams', async () => {
    renderBookingModal()

    await waitFor(() => {
      expect(screen.getByText('Selecione um time')).toBeInTheDocument()
    })
  })

  it('renders lobby fields', async () => {
    renderBookingModal()

    expect(screen.getByPlaceholderText('AVL-SCRIM')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('senha123')).toBeInTheDocument()
    expect(screen.getByText('Servidor')).toBeInTheDocument()
  })

  it('fills lobby fields and submits booking via select interactions', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const { onOpenChange } = renderBookingModal()

    await waitFor(() => {
      expect(screen.getByText('Selecione um time')).toBeInTheDocument()
    })

    const comboboxes = screen.getAllByRole('combobox')

    await user.click(comboboxes[0])
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /Rock n Sports/ })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('option', { name: /Rock n Sports/ }))

    await user.type(screen.getByPlaceholderText('AVL-SCRIM'), 'avalanche-vs-rns')
    await user.type(screen.getByPlaceholderText('senha123'), 'scrim123')

    await user.click(comboboxes[1])
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'BR' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('option', { name: 'BR' }))

    await user.click(screen.getByRole('button', { name: 'Agendar Scrim' }))

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('does not render when slot is null', () => {
    const { container } = renderBookingModal(null)
    expect(container.innerHTML).toBe('')
  })
})
