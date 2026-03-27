import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import Header from './Header'

const mockLogout = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ logout: mockLogout }),
}))

vi.mock('@/hooks/useCalendarChannel', () => ({
  useCalendarChannel: () => ({ connected: true, announcement: '' }),
}))

function renderHeader(variant: 'public' | 'auth' | 'admin') {
  return render(
    <MemoryRouter>
      <Header variant={variant} />
    </MemoryRouter>,
  )
}

describe('Header', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    })
    mockLogout.mockClear()
  })

  describe('variant="public" unauthenticated', () => {
    it('renders logo, Login link and Registre-se link', () => {
      renderHeader('public')

      expect(screen.getByRole('link', { name: /dota2scrims/i })).toHaveAttribute('href', '/')
      expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login')
      expect(screen.getByRole('link', { name: /registre-se/i })).toHaveAttribute('href', '/register')
    })

    it('does not render logout button', () => {
      renderHeader('public')

      expect(screen.queryByRole('button', { name: /sair/i })).not.toBeInTheDocument()
    })
  })

  describe('variant="public" authenticated', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          email: 'renan@test.com',
          name: 'Renan',
          role: 'admin',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        token: 'fake-token',
        isAuthenticated: true,
        isAdmin: true,
      })
    })

    it('renders logo, user email and logout button', () => {
      renderHeader('public')

      expect(screen.getByRole('link', { name: /dota2scrims/i })).toBeInTheDocument()
      expect(screen.getByText('renan@test.com')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument()
    })

    it('does not render Login or Registre-se links', () => {
      renderHeader('public')

      expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /registre-se/i })).not.toBeInTheDocument()
    })
  })

  describe('variant="auth"', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: {
          id: 2,
          email: 'manager@test.com',
          name: 'Manager',
          role: 'manager',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        token: 'fake-token',
        isAuthenticated: true,
        isAdmin: false,
      })
    })

    it('renders logo, user email and logout button', () => {
      renderHeader('auth')

      expect(screen.getByRole('link', { name: /dota2scrims/i })).toBeInTheDocument()
      expect(screen.getByText('manager@test.com')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument()
    })

    it('does not render Admin badge', () => {
      renderHeader('auth')

      expect(screen.queryByText(/admin/i)).not.toBeInTheDocument()
    })
  })

  describe('variant="admin"', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          email: 'admin@test.com',
          name: 'Admin',
          role: 'admin',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        token: 'fake-token',
        isAuthenticated: true,
        isAdmin: true,
      })
    })

    it('renders logo, Admin badge, user email and logout button', () => {
      renderHeader('admin')

      expect(screen.getByRole('link', { name: /dota2scrims/i })).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('admin@test.com')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument()
    })
  })

  describe('logout action', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: {
          id: 1,
          email: 'renan@test.com',
          name: 'Renan',
          role: 'admin',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        token: 'fake-token',
        isAuthenticated: true,
        isAdmin: true,
      })
    })

    it('calls logout when Sair button is clicked', async () => {
      const user = userEvent.setup()
      renderHeader('public')

      await user.click(screen.getByRole('button', { name: /sair/i }))

      expect(mockLogout).toHaveBeenCalledOnce()
    })
  })
})
