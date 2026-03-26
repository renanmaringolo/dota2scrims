import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/tests/mocks/server'
import { renderWithProviders } from '@/tests/utils'
import PublicCalendar from './PublicCalendar'

describe('PublicCalendar', () => {
  it('renders the calendar', () => {
    server.use(
      http.get('/api/time_slots', () => {
        return HttpResponse.json({ data: [] })
      }),
    )

    renderWithProviders(<PublicCalendar />)

    expect(screen.getByText('Hoje')).toBeInTheDocument()
  })
})
