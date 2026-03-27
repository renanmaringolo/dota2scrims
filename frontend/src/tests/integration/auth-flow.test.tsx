import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import Login from '@/app/pages/auth/Login'
import Register from '@/app/pages/auth/Register'
import AuthLayout from '@/app/layouts/AuthLayout'
import PublicLayout from '@/app/layouts/PublicLayout'
import ManagerDashboard from '@/app/pages/manager/ManagerDashboard'
import PrivateRoute from '@/components/auth/PrivateRoute'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
}

function renderWithRouter(initialEntry: string) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route element={<PublicLayout />}>
              <Route path="/dashboard" element={<ManagerDashboard />} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Auth Flow Integration', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    })
  })

  it('logs in with valid credentials and redirects to dashboard', async () => {
    const user = userEvent.setup()
    renderWithRouter('/login')

    expect(screen.getByText('Bem-vindo de volta')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Email'), 'admin@avalanche.gg')
    await user.type(screen.getByLabelText('Senha'), 'password')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    expect(useAuthStore.getState().user?.email).toBe('admin@avalanche.gg')
    expect(useAuthStore.getState().token).toBe('fake-jwt-token')
  })

  it('shows error message with invalid credentials', async () => {
    const user = userEvent.setup()
    renderWithRouter('/login')

    await user.type(screen.getByLabelText('Email'), 'wrong@email.com')
    await user.type(screen.getByLabelText('Senha'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })

    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('registers and stores auth state', async () => {
    const user = userEvent.setup()
    renderWithRouter('/register')

    expect(screen.getByText('Crie sua conta')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Email'), 'manager@team.com')
    await user.type(screen.getByLabelText('Senha'), 'password123')
    await user.type(screen.getByLabelText('Confirmar Senha'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Criar Conta' }))

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true)
    })

    expect(useAuthStore.getState().user?.email).toBe('manager@team.com')
    expect(useAuthStore.getState().token).toBe('fake-register-token')
  })

  it('redirects unauthenticated user to login', () => {
    renderWithRouter('/dashboard')

    expect(screen.getByText('Bem-vindo de volta')).toBeInTheDocument()
  })

  it('logs out and clears auth state', async () => {
    useAuthStore.setState({
      user: { id: 1, email: 'admin@avalanche.gg', name: 'Admin', role: 'manager', created_at: '', updated_at: '' },
      token: 'fake-jwt-token',
      isAuthenticated: true,
      isAdmin: false,
    })

    const user = userEvent.setup()
    renderWithRouter('/dashboard')

    await waitFor(() => {
      expect(screen.getByLabelText('Sair da conta')).toBeInTheDocument()
    })

    await user.click(screen.getByLabelText('Sair da conta'))

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().token).toBeNull()
    })
  })
})
