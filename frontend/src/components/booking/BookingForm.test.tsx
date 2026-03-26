import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { toast } from 'sonner'
import { renderWithProviders, userEvent } from '@/tests/utils'
import { server } from '@/tests/mocks/server'
import BookingForm from './BookingForm'
import type { TimeSlot } from '@/types/models'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

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

const mockOnSuccess = vi.fn()

describe('BookingForm', () => {
  it('renders team selector field', () => {
    renderWithProviders(
      <BookingForm slot={mockSlot} onSuccess={mockOnSuccess} />,
    )

    expect(screen.getByText('Time Adversario')).toBeInTheDocument()
  })

  it('renders lobby fields', () => {
    renderWithProviders(
      <BookingForm slot={mockSlot} onSuccess={mockOnSuccess} />,
    )

    expect(screen.getByLabelText('Nome do Lobby')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha do Lobby')).toBeInTheDocument()
    expect(screen.getByText('Servidor')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    renderWithProviders(
      <BookingForm slot={mockSlot} onSuccess={mockOnSuccess} />,
    )

    expect(screen.getByRole('button', { name: 'Agendar Scrim' })).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <BookingForm slot={mockSlot} onSuccess={mockOnSuccess} />,
    )

    await user.click(screen.getByRole('button', { name: 'Agendar Scrim' }))

    await waitFor(() => {
      expect(screen.getByText('Nome do lobby e obrigatorio')).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    async function fillAndSubmitForm(user: ReturnType<typeof userEvent.setup>) {
      server.use(
        http.get('/api/teams', () => {
          return HttpResponse.json({
            data: [{ id: 2, name: 'Rock n Sports', mmr: 4500, players_count: 5, created_at: '2026-01-01T00:00:00Z' }],
            meta: { total: 1 },
          })
        }),
      )

      renderWithProviders(<BookingForm slot={mockSlot} onSuccess={mockOnSuccess} />)

      const comboboxes = await screen.findAllByRole('combobox')
      const teamTrigger = comboboxes[0]
      await user.click(teamTrigger)
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Rock n Sports/ })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('option', { name: /Rock n Sports/ }))

      await user.type(screen.getByLabelText('Nome do Lobby'), 'AVL-SCRIM')
      await user.type(screen.getByLabelText('Senha do Lobby'), 'senha123')

      const serverTrigger = comboboxes[1]
      await user.click(serverTrigger)
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'BR' })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('option', { name: 'BR' }))

      await user.click(screen.getByRole('button', { name: 'Agendar Scrim' }))
    }

    it('shows specific toast on 409 conflict', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('/api/scrims', () => {
          return HttpResponse.json(
            { error: { status: 409, status_text: 'Conflict', code: 'slot_already_booked', message: 'Slot already booked' } },
            { status: 409 },
          )
        }),
      )

      await fillAndSubmitForm(user)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Este slot ja foi agendado por outro time')
      })
    })

    it('shows inline error on 422 validation error', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('/api/scrims', () => {
          return HttpResponse.json(
            { error: { status: 422, status_text: 'Unprocessable Entity', code: 'validation_error', message: 'Team must exist' } },
            { status: 422 },
          )
        }),
      )

      await fillAndSubmitForm(user)

      await waitFor(() => {
        expect(screen.getByText('Team must exist')).toBeInTheDocument()
      })
    })

    it('shows generic toast on 500 server error', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('/api/scrims', () => {
          return HttpResponse.json(
            { error: { status: 500, status_text: 'Internal Server Error', code: 'internal_error', message: 'Something went wrong' } },
            { status: 500 },
          )
        }),
      )

      await fillAndSubmitForm(user)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro interno, tente novamente')
      })
    })
  })
})
