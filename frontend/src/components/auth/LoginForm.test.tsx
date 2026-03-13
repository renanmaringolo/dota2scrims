import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse, delay } from 'msw'
import { server } from '@/tests/mocks/server'
import { renderWithProviders, userEvent } from '@/tests/utils'
import { useAuthStore } from '@/stores/authStore'
import LoginForm from './LoginForm'

describe('LoginForm', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('renders email, password fields and submit button', () => {
    renderWithProviders(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('shows validation error when submitting with empty email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText(/email invalido/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when submitting with short password', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'admin@avalanche.gg')
    await user.type(screen.getByLabelText(/senha/i), '123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText(/senha deve ter no minimo 6 caracteres/i)).toBeInTheDocument()
    })
  })

  it('submits with valid credentials and updates auth store', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'admin@avalanche.gg')
    await user.type(screen.getByLabelText(/senha/i), 'password')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      const state = useAuthStore.getState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.user?.email).toBe('admin@avalanche.gg')
    })
  })

  it('shows server error when login fails with 401', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'wrong@email.com')
    await user.type(screen.getByLabelText(/senha/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })

  it('disables submit button during loading', async () => {
    server.use(
      http.post('/api/auth/login', async () => {
        await delay('infinite')
        return HttpResponse.json({})
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'admin@avalanche.gg')
    await user.type(screen.getByLabelText(/senha/i), 'password')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
    })
  })

  it('renders link to register page', () => {
    renderWithProviders(<LoginForm />)

    const link = screen.getByRole('link', { name: /registre-se/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/register')
  })
})
