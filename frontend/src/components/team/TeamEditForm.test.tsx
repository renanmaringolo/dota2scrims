import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { renderWithProviders, userEvent } from '@/tests/utils'
import { server } from '@/tests/mocks/server'
import TeamEditForm from './TeamEditForm'
import type { Team } from '@/types/models'

const mockTeam: Team = {
  id: 1,
  name: 'Avalanche eSports',
  manager_name: 'Renan Proenca',
  manager_email: 'renan@avalanche.gg',
  timezone: 'America/Sao_Paulo',
  mmr: 5500,
  created_at: '2026-01-01T00:00:00Z',
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
}

describe('TeamEditForm', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/teams', () => {
        return HttpResponse.json({ data: [] })
      }),
      http.patch('/api/teams/1', async ({ request }) => {
        const body = (await request.json()) as { team: Record<string, unknown> }
        return HttpResponse.json({
          data: { ...mockTeam, ...body.team },
        })
      }),
    )
  })

  it('renders form pre-populated with team data', () => {
    renderWithProviders(<TeamEditForm team={mockTeam} />)

    expect(screen.getByLabelText(/nome do time/i)).toHaveValue('Avalanche eSports')
    expect(screen.getByLabelText(/nome do manager/i)).toHaveValue('Renan Proenca')
    expect(screen.getByLabelText(/email/i)).toHaveValue('renan@avalanche.gg')
  })

  it('renders roster section with players', () => {
    renderWithProviders(<TeamEditForm team={mockTeam} />)

    expect(screen.getByText('Metallica')).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
    expect(screen.getByText('HC')).toBeInTheDocument()
    expect(screen.getByText('Mid')).toBeInTheDocument()
  })

  it('shows empty roster message when no players', () => {
    const teamWithoutPlayers = { ...mockTeam, players: [] }
    renderWithProviders(<TeamEditForm team={teamWithoutPlayers} />)

    expect(screen.getByText(/nenhum jogador no roster/i)).toBeInTheDocument()
  })

  it('shows save button', () => {
    renderWithProviders(<TeamEditForm team={mockTeam} />)

    expect(screen.getByRole('button', { name: /salvar/i })).toBeEnabled()
  })

  it('shows validation error when name is cleared', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TeamEditForm team={mockTeam} />)

    const nameInput = screen.getByLabelText(/nome do time/i)
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    expect(await screen.findByText('Nome e obrigatorio')).toBeInTheDocument()
  })
})
