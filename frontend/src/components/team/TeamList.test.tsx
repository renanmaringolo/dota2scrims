import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { renderWithProviders } from '@/tests/utils'
import { server } from '@/tests/mocks/server'
import TeamList from './TeamList'

const mockTeams = [
  {
    id: 1,
    name: 'Avalanche eSports',
    mmr: 5500,
    players_count: 5,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Rock n Sports',
    mmr: 0,
    players_count: 0,
    created_at: '2026-01-02T00:00:00Z',
  },
]

describe('TeamList', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/teams', () => {
        return HttpResponse.json({ data: mockTeams })
      }),
    )
  })

  it('renders list of teams', async () => {
    renderWithProviders(<TeamList />)

    expect(await screen.findByText('Avalanche eSports')).toBeInTheDocument()
    expect(screen.getByText('Rock n Sports')).toBeInTheDocument()
  })

  it('displays mmr', async () => {
    renderWithProviders(<TeamList />)

    expect(await screen.findByText('5500 MMR')).toBeInTheDocument()
  })

  it('renders empty state when no teams', async () => {
    server.use(
      http.get('/api/teams', () => {
        return HttpResponse.json({ data: [] })
      }),
    )

    renderWithProviders(<TeamList />)

    expect(await screen.findByText('Nenhum time cadastrado')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    renderWithProviders(<TeamList />)

    expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument()
  })

  it('renders new team button', async () => {
    renderWithProviders(<TeamList />)

    expect(await screen.findByRole('link', { name: /novo time/i })).toBeInTheDocument()
  })
})
