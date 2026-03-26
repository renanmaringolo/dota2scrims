import { waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { toast } from 'sonner'
import { renderWithProviders } from '@/tests/utils'
import { server } from '@/tests/mocks/server'
import CancelScrimDialog from './CancelScrimDialog'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  scrimId: 1,
  onSuccess: vi.fn(),
}

describe('CancelScrimDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title and description when open', () => {
    renderWithProviders(<CancelScrimDialog {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'Cancelar Scrim' })).toBeInTheDocument()
    expect(screen.getByText(/Esta ação não pode ser desfeita/)).toBeInTheDocument()
  })

  it('renders textarea for reason', () => {
    renderWithProviders(<CancelScrimDialog {...defaultProps} />)
    expect(screen.getByPlaceholderText('Motivo do cancelamento...')).toBeInTheDocument()
  })

  it('disables submit button when reason is empty', () => {
    renderWithProviders(<CancelScrimDialog {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Cancelar Scrim' })).toBeDisabled()
  })

  it('disables submit button when reason has less than 10 characters', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CancelScrimDialog {...defaultProps} />)

    await user.type(screen.getByPlaceholderText('Motivo do cancelamento...'), 'curto')
    expect(screen.getByRole('button', { name: 'Cancelar Scrim' })).toBeDisabled()
  })

  it('enables submit button when reason has 10+ characters', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CancelScrimDialog {...defaultProps} />)

    await user.type(screen.getByPlaceholderText('Motivo do cancelamento...'), 'Time indisponivel hoje')
    expect(screen.getByRole('button', { name: 'Cancelar Scrim' })).toBeEnabled()
  })

  it('calls cancelScrimMutation and onSuccess on submit', async () => {
    const onSuccess = vi.fn()
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    server.use(
      http.post('/api/scrims/1/cancel', async ({ request }) => {
        const body = (await request.json()) as { reason: string }
        return HttpResponse.json({
          data: {
            id: 1,
            status: 'cancelled',
            time_slot: { id: 10, starts_at: '2026-03-27T20:00:00Z', ends_at: '2026-03-27T22:00:00Z', status: 'available' },
            team: { id: 2, name: 'Rock n Sports', mmr: 4500 },
            cancellation_reason: body.reason,
            cancelled_at: '2026-03-26T15:00:00Z',
            created_at: '2026-03-26T10:00:00Z',
          },
        })
      }),
    )

    renderWithProviders(
      <CancelScrimDialog
        open
        onOpenChange={onOpenChange}
        scrimId={1}
        onSuccess={onSuccess}
      />,
    )

    await user.type(screen.getByPlaceholderText('Motivo do cancelamento...'), 'Time indisponivel hoje')
    await user.click(screen.getByRole('button', { name: 'Cancelar Scrim' }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce()
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onOpenChange(false) when clicking Voltar', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<CancelScrimDialog {...defaultProps} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows validation hint when reason is too short', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CancelScrimDialog {...defaultProps} />)

    await user.type(screen.getByPlaceholderText('Motivo do cancelamento...'), 'curto')
    expect(screen.getByText(/minimo 10 caracteres/i)).toBeInTheDocument()
  })

  describe('error handling', () => {
    it('shows specific toast on 409 conflict', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('/api/scrims/1/cancel', () => {
          return HttpResponse.json(
            { error: { status: 409, status_text: 'Conflict', code: 'already_cancelled', message: 'Scrim already cancelled' } },
            { status: 409 },
          )
        }),
      )

      renderWithProviders(<CancelScrimDialog {...defaultProps} />)
      await user.type(screen.getByPlaceholderText('Motivo do cancelamento...'), 'Time indisponivel hoje')
      await user.click(screen.getByRole('button', { name: 'Cancelar Scrim' }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Esta scrim ja foi cancelada')
      })
    })

    it('shows API message on 422 validation error', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('/api/scrims/1/cancel', () => {
          return HttpResponse.json(
            { error: { status: 422, status_text: 'Unprocessable Entity', code: 'validation_error', message: 'Reason is too short' } },
            { status: 422 },
          )
        }),
      )

      renderWithProviders(<CancelScrimDialog {...defaultProps} />)
      await user.type(screen.getByPlaceholderText('Motivo do cancelamento...'), 'Time indisponivel hoje')
      await user.click(screen.getByRole('button', { name: 'Cancelar Scrim' }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Reason is too short')
      })
    })

    it('shows generic toast on 500 server error', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('/api/scrims/1/cancel', () => {
          return HttpResponse.json(
            { error: { status: 500, status_text: 'Internal Server Error', code: 'internal_error', message: 'Something went wrong' } },
            { status: 500 },
          )
        }),
      )

      renderWithProviders(<CancelScrimDialog {...defaultProps} />)
      await user.type(screen.getByPlaceholderText('Motivo do cancelamento...'), 'Time indisponivel hoje')
      await user.click(screen.getByRole('button', { name: 'Cancelar Scrim' }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Erro interno, tente novamente')
      })
    })
  })
})
