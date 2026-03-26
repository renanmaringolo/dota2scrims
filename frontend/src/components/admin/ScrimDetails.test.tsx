import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ScrimDetails from './ScrimDetails'
import type { Scrim, ScrimDetail } from '@/types'

const mockCancelMutate = vi.fn()

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const detailData: ScrimDetail = {
  id: 1,
  status: 'scheduled',
  time_slot: {
    id: 10,
    starts_at: '2026-03-26T19:00:00Z',
    ends_at: '2026-03-26T20:00:00Z',
    status: 'booked',
  },
  team: {
    id: 1,
    name: 'Lero Lero',
    mmr: 4500,
    manager_name: 'Renan Proenca',
    manager_email: 'renan@test.com',
    players: [
      { id: 1, nickname: 'Metallica', role: 'hard_carry', mmr: 5000 },
      { id: 2, nickname: 'Backend', role: 'mid_laner', mmr: 4800 },
      { id: 3, nickname: 'Teste', role: 'offlaner', mmr: 4500 },
      { id: 4, nickname: 'Marketing', role: 'support_4', mmr: 4200 },
      { id: 5, nickname: 'Lead', role: 'support_5', mmr: 4000 },
      { id: 6, nickname: 'Campanha', role: 'coach', mmr: 0 },
    ],
  },
  lobby_name: 'lobby-test-1',
  lobby_password: 'secret123',
  server_host: 'br',
  notes: 'Bo3 treino',
  created_at: '2026-03-25T10:00:00Z',
  updated_at: '2026-03-25T10:00:00Z',
}

const cancelledDetailData: ScrimDetail = {
  ...detailData,
  id: 2,
  status: 'cancelled',
  cancellation_reason: 'Time indisponivel',
  cancelled_at: '2026-03-26T15:00:00Z',
}

vi.mock('@/hooks/useAdminScrims', () => ({
  useAdminScrimDetail: (id: number) => ({
    data: id === 2 ? cancelledDetailData : detailData,
    isLoading: false,
  }),
  useCancelAdminScrim: () => ({
    mutateAsync: mockCancelMutate,
    isPending: false,
  }),
}))

const scheduledScrim: Scrim = {
  id: 1,
  status: 'scheduled',
  time_slot: {
    id: 10,
    starts_at: '2026-03-26T19:00:00Z',
    ends_at: '2026-03-26T20:00:00Z',
  },
  team: { id: 1, name: 'Lero Lero', mmr: 4500 },
  lobby_name: 'lobby-test-1',
  lobby_password: 'secret123',
  server_host: 'br',
  created_at: '2026-03-25T10:00:00Z',
}

const cancelledScrim: Scrim = {
  ...scheduledScrim,
  id: 2,
  status: 'cancelled',
  cancellation_reason: 'Time indisponivel',
  cancelled_at: '2026-03-26T15:00:00Z',
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function renderComponent(scrim: Scrim | null, onClose = vi.fn()) {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ScrimDetails scrim={scrim} onClose={onClose} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ScrimDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when scrim is null', () => {
    const { container } = renderComponent(null)
    expect(container.querySelector('[data-slot="dialog-content"]')).not.toBeInTheDocument()
  })

  describe('header', () => {
    it('renders team name', () => {
      renderComponent(scheduledScrim)
      expect(screen.getByText('Lero Lero')).toBeInTheDocument()
    })

    it('renders status badge', () => {
      renderComponent(scheduledScrim)
      expect(screen.getByText('Scheduled')).toBeInTheDocument()
    })

    it('renders formatted date', () => {
      renderComponent(scheduledScrim)
      expect(screen.getByText(/26\/03\/2026/)).toBeInTheDocument()
    })
  })

  describe('team info', () => {
    it('renders manager name from detail data', () => {
      renderComponent(scheduledScrim)
      expect(screen.getByText('Renan Proenca')).toBeInTheDocument()
    })

    it('renders manager email from detail data', () => {
      renderComponent(scheduledScrim)
      expect(screen.getByText('renan@test.com')).toBeInTheDocument()
    })

    it('renders team MMR', () => {
      renderComponent(scheduledScrim)
      expect(screen.getAllByText('4500').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('roster', () => {
    it('renders all player nicknames', () => {
      renderComponent(scheduledScrim)

      expect(screen.getByText('Metallica')).toBeInTheDocument()
      expect(screen.getByText('Backend')).toBeInTheDocument()
      expect(screen.getByText('Teste')).toBeInTheDocument()
      expect(screen.getByText('Marketing')).toBeInTheDocument()
      expect(screen.getByText('Lead')).toBeInTheDocument()
      expect(screen.getByText('Campanha')).toBeInTheDocument()
    })

    it('renders role labels', () => {
      renderComponent(scheduledScrim)

      expect(screen.getByText('HC')).toBeInTheDocument()
      expect(screen.getByText('Mid')).toBeInTheDocument()
      expect(screen.getByText('Off')).toBeInTheDocument()
      expect(screen.getByText('P4')).toBeInTheDocument()
      expect(screen.getByText('P5')).toBeInTheDocument()
      expect(screen.getByText('Coach')).toBeInTheDocument()
    })
  })

  describe('lobby info', () => {
    it('renders lobby name and password', () => {
      renderComponent(scheduledScrim)

      expect(screen.getByText('lobby-test-1')).toBeInTheDocument()
      expect(screen.getByText('secret123')).toBeInTheDocument()
    })

    it('renders copy buttons', () => {
      renderComponent(scheduledScrim)

      const copyButtons = screen.getAllByRole('button', { name: /copiar/i })
      expect(copyButtons.length).toBeGreaterThanOrEqual(2)
    })

    it('renders server badge in uppercase', () => {
      renderComponent(scheduledScrim)
      expect(screen.getByText('BR')).toBeInTheDocument()
    })
  })

  describe('notes', () => {
    it('renders notes when present in detail data', () => {
      renderComponent(scheduledScrim)
      expect(screen.getByText('Bo3 treino')).toBeInTheDocument()
    })
  })

  describe('cancel scheduled scrim', () => {
    it('renders cancel button for scheduled scrims', () => {
      renderComponent(scheduledScrim)
      expect(screen.getByRole('button', { name: /cancelar scrim/i })).toBeInTheDocument()
    })

    it('shows cancel form when cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderComponent(scheduledScrim)

      await user.click(screen.getByRole('button', { name: /cancelar scrim/i }))

      expect(screen.getByPlaceholderText(/motivo/i)).toBeInTheDocument()
    })

    it('requires reason to confirm', async () => {
      const user = userEvent.setup()
      renderComponent(scheduledScrim)

      await user.click(screen.getByRole('button', { name: /cancelar scrim/i }))

      const confirmButton = screen.getByRole('button', { name: /confirmar cancelamento/i })
      expect(confirmButton).toBeDisabled()
    })

    it('enables confirm when reason is provided', async () => {
      const user = userEvent.setup()
      renderComponent(scheduledScrim)

      await user.click(screen.getByRole('button', { name: /cancelar scrim/i }))
      await user.type(screen.getByPlaceholderText(/motivo/i), 'Time desistiu')

      const confirmButton = screen.getByRole('button', { name: /confirmar cancelamento/i })
      expect(confirmButton).toBeEnabled()
    })

    it('does not render cancel button for completed scrims', () => {
      const completedScrim: Scrim = { ...scheduledScrim, status: 'completed' }
      renderComponent(completedScrim)
      expect(screen.queryByRole('button', { name: /cancelar scrim/i })).not.toBeInTheDocument()
    })

    it('does not render cancel button for cancelled scrims', () => {
      renderComponent(cancelledScrim)
      expect(screen.queryByRole('button', { name: /cancelar scrim/i })).not.toBeInTheDocument()
    })
  })

  describe('cancelled scrim info', () => {
    it('shows cancellation reason', () => {
      renderComponent(cancelledScrim)
      expect(screen.getByText('Time indisponivel')).toBeInTheDocument()
    })

    it('shows cancelled status badge', () => {
      renderComponent(cancelledScrim)
      expect(screen.getByText('Cancelled')).toBeInTheDocument()
    })
  })

  describe('close dialog', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      renderComponent(scheduledScrim, onClose)

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(onClose).toHaveBeenCalled()
    })
  })
})
