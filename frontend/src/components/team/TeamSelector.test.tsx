import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { renderWithProviders } from '@/tests/utils'
import { server } from '@/tests/mocks/server'
import TeamSelector from './TeamSelector'

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
    mmr: 4800,
    players_count: 3,
    created_at: '2026-01-02T00:00:00Z',
  },
]

describe('TeamSelector', () => {
  beforeEach(() => {
    Element.prototype.hasPointerCapture = () => false
    Element.prototype.setPointerCapture = () => {}
    Element.prototype.releasePointerCapture = () => {}
    Element.prototype.scrollIntoView = () => {}

    server.use(
      http.get('/api/teams', () => {
        return HttpResponse.json({ data: mockTeams })
      }),
    )
  })

  it('renders select with placeholder', async () => {
    renderWithProviders(<TeamSelector onChange={vi.fn()} />)

    expect(await screen.findByText(/selecione um time/i)).toBeInTheDocument()
  })

  it('renders combobox trigger', async () => {
    renderWithProviders(<TeamSelector onChange={vi.fn()} />)

    await screen.findByText(/selecione um time/i)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('accepts value prop', async () => {
    const onChange = vi.fn()
    renderWithProviders(<TeamSelector value={1} onChange={onChange} />)

    await screen.findByRole('combobox')
    expect(onChange).not.toHaveBeenCalled()
  })
})
