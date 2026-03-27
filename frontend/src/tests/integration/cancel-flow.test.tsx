import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import ManagerScrimCard from '@/components/manager/ManagerScrimCard'
import type { Scrim } from '@/types'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
}

const futureDate = new Date(Date.now() + 86400000).toISOString()

const scheduledScrim: Scrim = {
  id: 1,
  status: 'scheduled',
  time_slot: { id: 10, starts_at: futureDate, ends_at: futureDate, status: 'booked' },
  team: { id: 2, name: 'Rock n Sports', mmr: 4500, manager_id: 2, created_at: '', updated_at: '' },
  lobby_name: 'avalanche-vs-rns',
  lobby_password: 'scrim123',
  server_host: 'br',
  created_at: '2026-03-26T10:00:00Z',
}

const cancelledScrim: Scrim = {
  ...scheduledScrim,
  id: 3,
  status: 'cancelled',
  cancellation_reason: 'Time indisponivel',
}

function renderScrimCard(scrim: Scrim = scheduledScrim) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ManagerScrimCard scrim={scrim} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Cancel Flow Integration', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 2, email: 'manager@team.com', name: 'Lero Lero', role: 'manager', created_at: '', updated_at: '' },
      token: 'fake-jwt-token',
      isAuthenticated: true,
      isAdmin: false,
    })
  })

  it('renders scrim card with cancel button for scheduled future scrims', () => {
    renderScrimCard()

    expect(screen.getByText('Rock n Sports')).toBeInTheDocument()
    expect(screen.getByText('Agendada')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cancelar/ })).toBeInTheDocument()
  })

  it('does not show cancel button for cancelled scrims', () => {
    renderScrimCard(cancelledScrim)

    expect(screen.getByText('Cancelada')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cancelar/ })).not.toBeInTheDocument()
    expect(screen.getByText(/Time indisponivel/)).toBeInTheDocument()
  })

  it('opens cancel dialog when clicking cancel button', async () => {
    const user = userEvent.setup()
    renderScrimCard()

    await user.click(screen.getByRole('button', { name: /Cancelar scrim contra/ }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cancelar Scrim' })).toBeInTheDocument()
      expect(screen.getByText(/Esta ação não pode ser desfeita/)).toBeInTheDocument()
    })
  })

  it('disables confirm button when reason is too short', async () => {
    const user = userEvent.setup()
    renderScrimCard()

    await user.click(screen.getByRole('button', { name: /Cancelar scrim contra/ }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cancelar Scrim' })).toBeInTheDocument()
    })

    const confirmButton = screen.getByRole('button', { name: 'Cancelar Scrim' })
    expect(confirmButton).toBeDisabled()

    await user.type(screen.getByPlaceholderText('Motivo do cancelamento...'), 'curto')

    expect(screen.getByText('Minimo 10 caracteres')).toBeInTheDocument()
    expect(confirmButton).toBeDisabled()
  })

  it('enables confirm button with valid reason and submits', async () => {
    const user = userEvent.setup()
    renderScrimCard()

    await user.click(screen.getByRole('button', { name: /Cancelar scrim contra/ }))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Motivo do cancelamento...')).toBeInTheDocument()
    })

    await user.type(
      screen.getByPlaceholderText('Motivo do cancelamento...'),
      'Time adversario desistiu do scrim',
    )

    const confirmButton = screen.getByRole('button', { name: 'Cancelar Scrim' })
    expect(confirmButton).toBeEnabled()

    await user.click(confirmButton)

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Cancelar Scrim' })).not.toBeInTheDocument()
    })
  })

  it('closes dialog when clicking back button', async () => {
    const user = userEvent.setup()
    renderScrimCard()

    await user.click(screen.getByRole('button', { name: /Cancelar scrim contra/ }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Voltar' }))

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Cancelar Scrim' })).not.toBeInTheDocument()
    })
  })
})
