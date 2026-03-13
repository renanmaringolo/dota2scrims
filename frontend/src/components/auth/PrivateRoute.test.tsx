import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import PrivateRoute from './PrivateRoute'

function renderWithRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('renders children when authenticated', () => {
    useAuthStore.getState().login(
      { id: 1, email: 'renan@test.com', name: 'Renan', role: 'manager', created_at: '', updated_at: '' },
      'fake-token',
    )

    renderWithRoute('/dashboard')

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithRoute('/dashboard')

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument()
  })

  it('preserves location.pathname in state.from', () => {
    function CaptureState() {
      const location = useLocation()
      const from = (location.state as { from?: string })?.from ?? 'none'
      return <div data-testid="from-state">{from}</div>
    }

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          </Route>
          <Route path="/login" element={<CaptureState />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByTestId('from-state')).toHaveTextContent('/dashboard')
  })
})
