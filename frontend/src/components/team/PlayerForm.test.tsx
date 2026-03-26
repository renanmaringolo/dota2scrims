import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { renderWithProviders, userEvent } from '@/tests/utils'
import { server } from '@/tests/mocks/server'
import PlayerForm from './PlayerForm'
import type { Player } from '@/types/models'

beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
  Element.prototype.scrollIntoView = () => {}
})

describe('PlayerForm', () => {
  const defaultProps = {
    teamId: 1,
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onSuccess = vi.fn()
    defaultProps.onCancel = vi.fn()

    server.use(
      http.post('/api/teams/1/players', async ({ request }) => {
        const body = (await request.json()) as { player: Record<string, unknown> }
        return HttpResponse.json(
          {
            data: {
              id: 10,
              nickname: body.player.nickname,
              role: body.player.role,
              mmr: body.player.mmr,
              team_id: 1,
              created_at: '2026-03-26T10:00:00Z',
            },
          },
          { status: 201 },
        )
      }),
      http.patch('/api/teams/1/players/5', async ({ request }) => {
        const body = (await request.json()) as { player: Record<string, unknown> }
        return HttpResponse.json({
          data: {
            id: 5,
            nickname: body.player.nickname ?? 'Lero Lero',
            role: body.player.role ?? 'hard_carry',
            mmr: body.player.mmr ?? 4200,
            team_id: 1,
            created_at: '2026-03-26T10:00:00Z',
          },
        })
      }),
    )
  })

  it('renders nickname, role and mmr fields', () => {
    renderWithProviders(<PlayerForm {...defaultProps} />)

    expect(screen.getByLabelText(/nickname/i)).toBeInTheDocument()
    expect(screen.getByText(/posicao/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mmr/i)).toBeInTheDocument()
  })

  it('renders submit and cancel buttons', () => {
    renderWithProviders(<PlayerForm {...defaultProps} />)

    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayerForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /salvar/i }))

    expect(await screen.findByText('Nickname e obrigatorio')).toBeInTheDocument()
    expect(screen.getByText('Posicao e obrigatoria')).toBeInTheDocument()
  })

  it('fills default values when player is passed (edit mode)', () => {
    const player: Player = {
      id: 5,
      nickname: 'Lero Lero',
      role: 'hard_carry',
      mmr: 4200,
      team_id: 1,
      created_at: '2026-03-26T10:00:00Z',
    }

    renderWithProviders(<PlayerForm {...defaultProps} player={player} />)

    expect(screen.getByLabelText(/nickname/i)).toHaveValue('Lero Lero')
    expect(screen.getByLabelText(/mmr/i)).toHaveValue(4200)
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PlayerForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(defaultProps.onCancel).toHaveBeenCalledOnce()
  })
})
