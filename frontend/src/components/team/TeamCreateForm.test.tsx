import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { renderWithProviders, userEvent } from '@/tests/utils'
import { server } from '@/tests/mocks/server'
import TeamCreateForm from './TeamCreateForm'

describe('TeamCreateForm', () => {
  beforeEach(() => {
    Element.prototype.hasPointerCapture = () => false
    Element.prototype.setPointerCapture = () => {}
    Element.prototype.releasePointerCapture = () => {}

    server.use(
      http.get('/api/teams', () => {
        return HttpResponse.json({ data: [] })
      }),
      http.post('/api/teams', async ({ request }) => {
        const body = (await request.json()) as { team: Record<string, unknown> }
        return HttpResponse.json(
          {
            data: {
              id: 1,
              ...body.team,
              mmr: 0,
              players: [],
              created_at: '2026-01-01T00:00:00Z',
            },
          },
          { status: 201 },
        )
      }),
    )
  })

  it('renders all form fields', () => {
    renderWithProviders(<TeamCreateForm />)

    expect(screen.getByLabelText(/nome do time/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nome do manager/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByText(/timezone/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar time/i })).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TeamCreateForm />)

    await user.click(screen.getByRole('button', { name: /criar time/i }))

    expect(await screen.findByText('Nome e obrigatorio')).toBeInTheDocument()
    expect(screen.getByText('Nome do manager e obrigatorio')).toBeInTheDocument()
  })

  it('shows multiple validation errors on partial submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TeamCreateForm />)

    await user.type(screen.getByLabelText(/nome do time/i), 'Lero Lero')
    await user.click(screen.getByRole('button', { name: /criar time/i }))

    expect(await screen.findByText('Nome do manager e obrigatorio')).toBeInTheDocument()
    expect(screen.getByText('Timezone e obrigatorio')).toBeInTheDocument()
  })

  it('shows timezone validation error on empty submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TeamCreateForm />)

    await user.type(screen.getByLabelText(/nome do time/i), 'Lero Lero')
    await user.type(screen.getByLabelText(/nome do manager/i), 'Renan')
    await user.type(screen.getByLabelText(/email/i), 'renan@test.com')
    await user.click(screen.getByRole('button', { name: /criar time/i }))

    expect(await screen.findByText('Timezone e obrigatorio')).toBeInTheDocument()
  })

  it('shows submit button with correct label', () => {
    renderWithProviders(<TeamCreateForm />)

    expect(screen.getByRole('button', { name: /criar time/i })).toBeEnabled()
  })
})
