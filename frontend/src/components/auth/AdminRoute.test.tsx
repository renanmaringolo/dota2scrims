import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import AdminRoute from './AdminRoute'

function renderWithRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>Admin Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AdminRoute', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('renders children when authenticated and admin', () => {
    useAuthStore.getState().login(
      { id: 1, email: 'renan@test.com', name: 'Renan', role: 'admin', created_at: '', updated_at: '' },
      'fake-token',
    )

    renderWithRoute('/admin')

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithRoute('/admin')

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('redirects to /dashboard when authenticated but not admin', () => {
    useAuthStore.getState().login(
      { id: 2, email: 'manager@test.com', name: 'Manager', role: 'manager', created_at: '', updated_at: '' },
      'fake-token',
    )

    renderWithRoute('/admin')

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })
})
