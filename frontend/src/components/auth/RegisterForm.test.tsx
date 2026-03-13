import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse, delay } from 'msw'
import { renderWithProviders, userEvent } from '@/tests/utils'
import { server } from '@/tests/mocks/server'
import { useAuthStore } from '@/stores/authStore'
import RegisterForm from './RegisterForm'

describe('RegisterForm', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('renders email, password, confirmation fields and submit button', () => {
    renderWithProviders(<RegisterForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
  })

  it('shows error for invalid email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterForm />)

    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByText(/email invalido/i)).toBeInTheDocument()
    })
  })

  it('shows error for short password', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^senha$/i), '123')
    await user.type(screen.getByLabelText(/confirmar senha/i), '123')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByText(/senha deve ter no minimo 6 caracteres/i)).toBeInTheDocument()
    })
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'different456')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByText(/senhas nao conferem/i)).toBeInTheDocument()
    })
  })

  it('submits with valid data and calls registerMutation', async () => {
    const user = userEvent.setup()
    renderWithProviders(<RegisterForm />)

    await user.type(screen.getByLabelText(/email/i), 'manager@team.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.token).toBeTruthy()
      expect(state.user?.email).toBe('manager@team.com')
    })
  })

  it('shows server error when registration fails with 422', async () => {
    server.use(
      http.post('/api/auth/register', () => {
        return HttpResponse.json(
          {
            error: {
              status: 422,
              status_text: 'Unprocessable Entity',
              code: 'validation_error',
              message: 'Email ja esta em uso',
            },
          },
          { status: 422 },
        )
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<RegisterForm />)

    await user.type(screen.getByLabelText(/email/i), 'existing@team.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByText(/email ja esta em uso/i)).toBeInTheDocument()
    })
  })

  it('disables button during loading', async () => {
    server.use(
      http.post('/api/auth/register', async () => {
        await delay('infinite')
        return new HttpResponse(null)
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<RegisterForm />)

    await user.type(screen.getByLabelText(/email/i), 'manager@team.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /criar conta/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /criando/i })).toBeDisabled()
    })
  })

  it('has a link to /login', () => {
    renderWithProviders(<RegisterForm />)

    const link = screen.getByRole('link', { name: /faca login/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/login')
  })
})
