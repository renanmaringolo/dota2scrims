import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { renderWithProviders } from '@/tests/utils'
import { server } from '@/tests/mocks/server'
import PlayerList from './PlayerList'
import type { Player } from '@/types/models'

beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
  Element.prototype.scrollIntoView = () => {}
})

const mockPlayers: Player[] = [
  { id: 1, nickname: 'Lero Lero', role: 'hard_carry', mmr: 4200, team_id: 1, created_at: '2026-03-26T10:00:00Z' },
  { id: 2, nickname: 'Bla Bla', role: 'mid_laner', mmr: 4500, team_id: 1, created_at: '2026-03-26T10:00:00Z' },
  { id: 3, nickname: 'Renan', role: 'offlaner', mmr: 4000, team_id: 1, created_at: '2026-03-26T10:00:00Z' },
]

describe('PlayerList', () => {
  beforeEach(() => {
    server.use(
      http.delete('/api/teams/1/players/:id', () => {
        return new HttpResponse(null, { status: 204 })
      }),
      http.post('/api/teams/1/players', async ({ request }) => {
        const body = (await request.json()) as { player: Record<string, unknown> }
        return HttpResponse.json(
          {
            data: {
              id: 10,
              ...body.player,
              team_id: 1,
              created_at: '2026-03-26T10:00:00Z',
            },
          },
          { status: 201 },
        )
      }),
    )
  })

  it('renders list of players with nickname and role', () => {
    renderWithProviders(<PlayerList teamId={1} players={mockPlayers} />)

    expect(screen.getByText('Lero Lero')).toBeInTheDocument()
    expect(screen.getByText('Bla Bla')).toBeInTheDocument()
    expect(screen.getByText('Renan')).toBeInTheDocument()
    expect(screen.getByText('HC')).toBeInTheDocument()
    expect(screen.getByText('Mid')).toBeInTheDocument()
    expect(screen.getByText('Off')).toBeInTheDocument()
  })

  it('shows "Adicionar Jogador" button', () => {
    renderWithProviders(<PlayerList teamId={1} players={mockPlayers} />)

    expect(screen.getByRole('button', { name: /adicionar jogador/i })).toBeInTheDocument()
  })

  it('shows starters indicator (X/5)', () => {
    renderWithProviders(<PlayerList teamId={1} players={mockPlayers} />)

    expect(screen.getByText(/3\/5 titulares/i)).toBeInTheDocument()
  })

  it('shows empty state when no players', () => {
    renderWithProviders(<PlayerList teamId={1} players={[]} />)

    expect(screen.getByText(/nenhum jogador no roster/i)).toBeInTheDocument()
  })

  it('excludes coach from starters count', () => {
    const playersWithCoach: Player[] = [
      ...mockPlayers,
      { id: 4, nickname: 'Coach', role: 'coach', mmr: 3000, team_id: 1, created_at: '2026-03-26T10:00:00Z' },
    ]

    renderWithProviders(<PlayerList teamId={1} players={playersWithCoach} />)

    expect(screen.getByText(/3\/5 titulares/i)).toBeInTheDocument()
  })
})
