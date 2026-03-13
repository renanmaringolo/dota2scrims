import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/tests/utils'
import PublicCalendar from './PublicCalendar'

describe('PublicCalendar', () => {
  it('renders the page title', () => {
    renderWithProviders(<PublicCalendar />)

    expect(screen.getByText('Scrim Calendar')).toBeInTheDocument()
  })
})
