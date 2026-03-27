import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import AdminLayout from './AdminLayout'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn((selector) => {
    const state = {
      user: { id: 1, email: 'admin@test.com', role: 'admin' },
      token: 'fake-token',
      isAuthenticated: true,
      isAdmin: true,
    }
    return selector(state)
  }),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}))

vi.mock('@/hooks/useCalendarChannel', () => ({
  useCalendarChannel: () => ({ connected: true, announcement: '' }),
}))

function renderLayout(initialRoute = '/admin') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div>Dashboard Page</div>} />
          <Route path="slots" element={<div>Slots Page</div>} />
          <Route path="scrims" element={<div>Scrims Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminLayout', () => {
  describe('desktop sidebar', () => {
    it('renders all nav links in the sidebar', () => {
      renderLayout()

      const links = screen.getAllByRole('link', { name: /scrims/i })
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /slots/i })).toBeInTheDocument()
      expect(links.length).toBeGreaterThanOrEqual(1)
    })

    it('renders the outlet content', () => {
      renderLayout()

      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })
  })

  describe('mobile drawer', () => {
    it('renders a hamburger button for mobile', () => {
      renderLayout()

      const menuButton = screen.getByRole('button', { name: /menu/i })
      expect(menuButton).toBeInTheDocument()
    })

    it('opens drawer when hamburger is clicked', async () => {
      const user = userEvent.setup()
      renderLayout()

      const menuButton = screen.getByRole('button', { name: /menu/i })
      await user.click(menuButton)

      const drawer = screen.getByTestId('mobile-drawer')
      expect(drawer).toBeInTheDocument()

      const drawerNav = within(drawer)
      expect(drawerNav.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
      expect(drawerNav.getByRole('link', { name: /slots/i })).toBeInTheDocument()
      expect(drawerNav.getByRole('link', { name: /scrims/i })).toBeInTheDocument()
    })

    it('shows overlay backdrop when drawer is open', async () => {
      const user = userEvent.setup()
      renderLayout()

      await user.click(screen.getByRole('button', { name: /menu/i }))

      expect(screen.getByTestId('drawer-backdrop')).toBeInTheDocument()
    })

    it('closes drawer when backdrop is clicked', async () => {
      const user = userEvent.setup()
      renderLayout()

      await user.click(screen.getByRole('button', { name: /menu/i }))
      expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument()

      await user.click(screen.getByTestId('drawer-backdrop'))
      expect(screen.queryByTestId('mobile-drawer')).not.toBeInTheDocument()
    })

    it('closes drawer when a nav link is clicked', async () => {
      const user = userEvent.setup()
      renderLayout()

      await user.click(screen.getByRole('button', { name: /menu/i }))
      const drawer = screen.getByTestId('mobile-drawer')

      await user.click(within(drawer).getByRole('link', { name: /slots/i }))
      expect(screen.queryByTestId('mobile-drawer')).not.toBeInTheDocument()
    })
  })
})
