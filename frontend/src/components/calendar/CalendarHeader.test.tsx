import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalendarHeader from './CalendarHeader'

describe('CalendarHeader', () => {
  const defaultProps = {
    selectedDate: new Date(2026, 2, 16),
    viewMode: 'week' as const,
    onPrev: vi.fn(),
    onNext: vi.fn(),
    onToday: vi.fn(),
    onViewModeChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders week date label', () => {
    render(<CalendarHeader {...defaultProps} />)

    expect(screen.getByText(/16/)).toBeInTheDocument()
    expect(screen.getByText(/Mar 2026/i)).toBeInTheDocument()
  })

  it('renders day date label', () => {
    render(<CalendarHeader {...defaultProps} viewMode="day" />)

    expect(screen.getByText(/16/)).toBeInTheDocument()
    expect(screen.getByText(/Mar 2026/i)).toBeInTheDocument()
  })

  it('calls onPrev when clicking previous button', async () => {
    const user = userEvent.setup()
    render(<CalendarHeader {...defaultProps} />)

    await user.click(screen.getByLabelText('Semana anterior'))
    expect(defaultProps.onPrev).toHaveBeenCalledOnce()
  })

  it('calls onNext when clicking next button', async () => {
    const user = userEvent.setup()
    render(<CalendarHeader {...defaultProps} />)

    await user.click(screen.getByLabelText('Próxima semana'))
    expect(defaultProps.onNext).toHaveBeenCalledOnce()
  })

  it('calls onToday when clicking today button', async () => {
    const user = userEvent.setup()
    render(<CalendarHeader {...defaultProps} />)

    await user.click(screen.getByText('Hoje'))
    expect(defaultProps.onToday).toHaveBeenCalledOnce()
  })

  it('calls onViewModeChange when toggling view', async () => {
    const user = userEvent.setup()
    render(<CalendarHeader {...defaultProps} />)

    await user.click(screen.getByText('Dia'))
    expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('day')
  })

  it('shows active state on current view mode button', () => {
    render(<CalendarHeader {...defaultProps} viewMode="week" />)

    const weekButton = screen.getByText('Semana')
    expect(weekButton).toHaveAttribute('data-active', 'true')
  })
})
