import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { renderWithProviders } from '@/tests/utils'
import { server } from '@/tests/mocks/server'
import { useAuthStore } from '@/stores/authStore'
import TeamProfileComponent from './TeamProfile'

const mockTeamDetail = {
  id: 1,
  name: 'Avalanche eSports',
  manager_name: 'Renan Proenca',
  manager_email: 'renan@avalanche.gg',
  timezone: 'America/Sao_Paulo',
  mmr: 5500,
  players: [
    {
      id: 1,
      nickname: 'Metallica',
      role: 'hard_carry',
      mmr: 6000,
      team_id: 1,
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 2,
      nickname: 'Backend',
      role: 'mid_laner',
      mmr: 5500,
      team_id: 1,
      created_at: '2026-01-01T00:00:00Z',
    },
  ],
  created_at: '2026-01-01T00:00:00Z',
}

describe('TeamProfile', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
    server.use(
      http.get('/api/teams/1', () => {
        return HttpResponse.json({ data: mockTeamDetail })
      }),
    )
  })

  it('renders team name and info', async () => {
    renderWithProviders(<TeamProfileComponent teamId={1} />)

    expect(await screen.findByText('Avalanche eSports')).toBeInTheDocument()
    expect(screen.getByText('Renan Proenca')).toBeInTheDocument()
    expect(screen.getAllByText('5500 MMR').length).toBeGreaterThanOrEqual(1)
  })

  it('renders player roster', async () => {
    renderWithProviders(<TeamProfileComponent teamId={1} />)

    expect(await screen.findByText('Metallica')).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
    expect(screen.getByText('HC')).toBeInTheDocument()
    expect(screen.getByText('Mid')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    renderWithProviders(<TeamProfileComponent teamId={1} />)

    expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument()
  })

  it('shows edit button for team manager', async () => {
    useAuthStore.getState().login(
      {
        id: 1,
        email: 'renan@avalanche.gg',
        name: 'Renan Proenca',
        role: 'manager',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      'fake-token',
    )

    renderWithProviders(<TeamProfileComponent teamId={1} />)

    expect(await screen.findByRole('link', { name: /editar/i })).toBeInTheDocument()
  })

  it('hides edit button for non-manager', async () => {
    useAuthStore.getState().login(
      {
        id: 99,
        email: 'other@team.com',
        name: 'Bla Bla',
        role: 'manager',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      'fake-token',
    )

    renderWithProviders(<TeamProfileComponent teamId={1} />)

    await screen.findByText('Avalanche eSports')
    expect(screen.queryByRole('link', { name: /editar/i })).not.toBeInTheDocument()
  })
})
