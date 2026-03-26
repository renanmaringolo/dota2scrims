import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/tests/utils'
import ManagerDashboard from './ManagerDashboard'

vi.mock('@/hooks/useScrims', () => ({
  useScrims: () => ({
    managerScrimsQuery: { data: [], isLoading: false },
    createScrimMutation: {},
    cancelScrimMutation: { mutate: vi.fn(), isPending: false },
  }),
}))

vi.mock('@/hooks/useTeams', () => ({
  useTeams: () => ({
    teamsQuery: { data: [], isLoading: false },
  }),
}))

describe('ManagerDashboard', () => {
  it('renders "Minhas Scrims" title', () => {
    renderWithProviders(<ManagerDashboard />)
    expect(screen.getByText('Minhas Scrims')).toBeInTheDocument()
  })

  it('renders description text', () => {
    renderWithProviders(<ManagerDashboard />)
    expect(screen.getByText(/histórico de agendamentos/i)).toBeInTheDocument()
  })

  it('renders link to teams', () => {
    renderWithProviders(<ManagerDashboard />)
    const link = screen.getByRole('link', { name: /meus times/i })
    expect(link).toBeInTheDocument()
  })

  it('renders ManagerScrimList section', () => {
    renderWithProviders(<ManagerDashboard />)
    expect(screen.getByText('Nenhuma scrim agendada')).toBeInTheDocument()
  })
})
