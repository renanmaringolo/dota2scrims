import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ManagerScrimCard from './ManagerScrimCard'
import type { Scrim } from '@/types'

const futureDate = '2026-04-15T20:00:00Z'
const pastDate = '2025-01-15T20:00:00Z'

const scheduledScrim: Scrim = {
  id: 1,
  status: 'scheduled',
  time_slot: { id: 10, starts_at: futureDate, ends_at: '2026-04-15T22:00:00Z' },
  team: { id: 2, name: 'Rock n Sports', mmr: 4500 },
  lobby_name: 'avalanche-vs-rns',
  lobby_password: 'scrim123',
  server_host: 'br',
  created_at: '2026-03-26T10:00:00Z',
}

const completedScrim: Scrim = {
  id: 2,
  status: 'completed',
  time_slot: { id: 11, starts_at: pastDate, ends_at: '2025-01-15T22:00:00Z' },
  team: { id: 3, name: 'Bla Bla', mmr: 3800 },
  lobby_name: 'avalanche-vs-bb',
  lobby_password: 'pass456',
  server_host: 'arg',
  created_at: '2025-01-14T10:00:00Z',
}

const cancelledScrim: Scrim = {
  id: 3,
  status: 'cancelled',
  time_slot: { id: 12, starts_at: futureDate, ends_at: '2026-04-15T22:00:00Z' },
  team: { id: 4, name: 'Lero Lero' },
  server_host: 'weu',
  cancellation_reason: 'Time indisponivel',
  cancelled_at: '2026-03-24T18:00:00Z',
  created_at: '2026-03-23T10:00:00Z',
}

const pastScheduledScrim: Scrim = {
  id: 4,
  status: 'scheduled',
  time_slot: { id: 13, starts_at: pastDate, ends_at: '2025-01-15T22:00:00Z' },
  team: { id: 5, name: 'Teste FC', mmr: 4000 },
  lobby_name: 'avalanche-vs-tfc',
  lobby_password: 'test789',
  server_host: 'br',
  created_at: '2025-01-14T10:00:00Z',
}

vi.mock('@/hooks/useScrims', () => ({
  useScrims: () => ({
    cancelScrimMutation: { mutate: vi.fn(), isPending: false },
  }),
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function renderCard(scrim: Scrim) {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ManagerScrimCard scrim={scrim} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ManagerScrimCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders team name', () => {
    renderCard(scheduledScrim)
    expect(screen.getByText('Rock n Sports')).toBeInTheDocument()
  })

  it('renders server label in uppercase', () => {
    renderCard(scheduledScrim)
    expect(screen.getByText('BR')).toBeInTheDocument()
  })

  it('renders lobby name and password', () => {
    renderCard(scheduledScrim)
    expect(screen.getByText('avalanche-vs-rns')).toBeInTheDocument()
    expect(screen.getByText('scrim123')).toBeInTheDocument()
  })

  it('renders cancel button for scheduled future scrim', () => {
    renderCard(scheduledScrim)
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('does not render cancel button for cancelled scrim', () => {
    renderCard(cancelledScrim)
    expect(screen.queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument()
  })

  it('does not render cancel button for past scheduled scrim', () => {
    renderCard(pastScheduledScrim)
    expect(screen.queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument()
  })

  it('does not render cancel button for completed scrim', () => {
    renderCard(completedScrim)
    expect(screen.queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument()
  })

  it('applies reduced opacity for cancelled scrim', () => {
    const { container } = renderCard(cancelledScrim)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('opacity-60')
  })

  it('copies lobby password to clipboard on click', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    renderCard(scheduledScrim)

    const copyButton = screen.getByRole('button', { name: /copiar/i })
    await user.click(copyButton)

    expect(writeText).toHaveBeenCalledWith('scrim123')
  })

  it('opens cancel dialog when cancel button is clicked', async () => {
    const user = userEvent.setup()
    renderCard(scheduledScrim)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
