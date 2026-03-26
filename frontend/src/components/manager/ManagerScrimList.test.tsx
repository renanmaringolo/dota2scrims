import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/tests/utils'
import ManagerScrimList from './ManagerScrimList'
import type { Scrim } from '@/types'

const mockScrims: Scrim[] = [
  {
    id: 1,
    status: 'scheduled',
    time_slot: { id: 10, starts_at: '2026-04-15T20:00:00Z', ends_at: '2026-04-15T22:00:00Z' },
    team: { id: 2, name: 'Rock n Sports', mmr: 4500 },
    lobby_name: 'avalanche-vs-rns',
    lobby_password: 'scrim123',
    server_host: 'br',
    created_at: '2026-03-26T10:00:00Z',
  },
  {
    id: 2,
    status: 'completed',
    time_slot: { id: 11, starts_at: '2025-01-15T20:00:00Z', ends_at: '2025-01-15T22:00:00Z' },
    team: { id: 3, name: 'Bla Bla', mmr: 3800 },
    lobby_name: 'avalanche-vs-bb',
    lobby_password: 'pass456',
    server_host: 'arg',
    created_at: '2025-01-14T10:00:00Z',
  },
]

vi.mock('@/hooks/useScrims', () => ({
  useScrims: vi.fn(),
}))

import { useScrims } from '@/hooks/useScrims'
const mockUseScrims = vi.mocked(useScrims)

describe('ManagerScrimList', () => {
  it('renders list of scrims', () => {
    mockUseScrims.mockReturnValue({
      managerScrimsQuery: { data: mockScrims, isLoading: false } as ReturnType<typeof useScrims>['managerScrimsQuery'],
      createScrimMutation: {} as ReturnType<typeof useScrims>['createScrimMutation'],
      cancelScrimMutation: { mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useScrims>['cancelScrimMutation'],
    })

    renderWithProviders(<ManagerScrimList />)

    expect(screen.getByText('Rock n Sports')).toBeInTheDocument()
    expect(screen.getByText('Bla Bla')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseScrims.mockReturnValue({
      managerScrimsQuery: { data: undefined, isLoading: true } as ReturnType<typeof useScrims>['managerScrimsQuery'],
      createScrimMutation: {} as ReturnType<typeof useScrims>['createScrimMutation'],
      cancelScrimMutation: { mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useScrims>['cancelScrimMutation'],
    })

    renderWithProviders(<ManagerScrimList />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows empty state when no scrims', () => {
    mockUseScrims.mockReturnValue({
      managerScrimsQuery: { data: [], isLoading: false } as unknown as ReturnType<typeof useScrims>['managerScrimsQuery'],
      createScrimMutation: {} as ReturnType<typeof useScrims>['createScrimMutation'],
      cancelScrimMutation: { mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useScrims>['cancelScrimMutation'],
    })

    renderWithProviders(<ManagerScrimList />)

    expect(screen.getByText('Nenhuma scrim agendada')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /agendar scrim/i })).toBeInTheDocument()
  })
})
