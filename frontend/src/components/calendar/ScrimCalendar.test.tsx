import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/tests/mocks/server'
import { renderWithProviders } from '@/tests/utils'
import { useCalendarStore } from '@/stores/calendarStore'
import ScrimCalendar from './ScrimCalendar'

const API_BASE = '/api'

const mockSlots = [
  {
    id: 1,
    starts_at: '2026-03-16T19:00:00Z',
    ends_at: '2026-03-16T20:30:00Z',
    status: 'available',
  },
  {
    id: 2,
    starts_at: '2026-03-17T21:00:00Z',
    ends_at: '2026-03-17T22:30:00Z',
    status: 'booked',
    scrim: { id: 1, team: { id: 1, name: 'Rock n Sports' } },
  },
]

describe('ScrimCalendar', () => {
  beforeEach(() => {
    useCalendarStore.setState({ selectedDate: new Date(2026, 2, 16), viewMode: 'week' })
  })
  it('shows loading skeleton initially', () => {
    server.use(
      http.get(`${API_BASE}/time_slots`, () => {
        return new Promise(() => {})
      }),
    )

    renderWithProviders(<ScrimCalendar />)

    expect(screen.getByTestId('skeleton-week')).toBeInTheDocument()
  })

  it('renders slots after loading', async () => {
    server.use(
      http.get(`${API_BASE}/time_slots`, () => {
        return HttpResponse.json({ data: mockSlots })
      }),
    )

    renderWithProviders(<ScrimCalendar />)

    await waitFor(() => {
      expect(screen.getByText('Disponivel')).toBeInTheDocument()
    })

    expect(screen.getByText('Reservado')).toBeInTheDocument()
  })

  it('renders empty state when no slots', async () => {
    server.use(
      http.get(`${API_BASE}/time_slots`, () => {
        return HttpResponse.json({ data: [] })
      }),
    )

    renderWithProviders(<ScrimCalendar />)

    await waitFor(() => {
      expect(screen.getByText('Sem slots na semana')).toBeInTheDocument()
    })
  })

  it('renders calendar header with navigation', async () => {
    server.use(
      http.get(`${API_BASE}/time_slots`, () => {
        return HttpResponse.json({ data: [] })
      }),
    )

    renderWithProviders(<ScrimCalendar />)

    expect(screen.getByText('Hoje')).toBeInTheDocument()
    expect(screen.getByLabelText('Semana anterior')).toBeInTheDocument()
    expect(screen.getByLabelText('Proxima semana')).toBeInTheDocument()
  })
})
