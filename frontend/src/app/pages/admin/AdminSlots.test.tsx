import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminSlots from './AdminSlots'
import type { TimeSlot } from '@/types'

const mockSlots: TimeSlot[] = [
  {
    id: 1,
    starts_at: '2026-03-26T19:00:00Z',
    ends_at: '2026-03-26T20:00:00Z',
    status: 'available',
  },
  {
    id: 2,
    starts_at: '2026-03-26T20:00:00Z',
    ends_at: '2026-03-26T21:00:00Z',
    status: 'booked',
    scrim: { id: 1, team: { id: 1, name: 'Lero Lero' } },
  },
  {
    id: 3,
    starts_at: '2026-03-27T19:00:00Z',
    ends_at: '2026-03-27T20:00:00Z',
    status: 'cancelled',
  },
]

const mockCreateSlot = vi.fn()
const mockUpdateSlot = vi.fn()
const mockDeleteSlot = vi.fn()

vi.mock('@/hooks/useTimeSlots', () => ({
  useTimeSlots: () => ({
    data: mockSlots,
    isLoading: false,
    error: null,
  }),
}))

vi.mock('@/hooks/useAdminSlots', () => ({
  useCreateSlot: () => ({
    mutateAsync: mockCreateSlot,
    isPending: false,
  }),
  useUpdateSlot: () => ({
    mutateAsync: mockUpdateSlot,
    isPending: false,
  }),
  useDeleteSlot: () => ({
    mutateAsync: mockDeleteSlot,
    isPending: false,
  }),
  useBulkCreateSlots: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function renderPage() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminSlots />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AdminSlots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('header', () => {
    it('renders page title and create slot button', () => {
      renderPage()

      expect(screen.getByText('Time Slots')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /criar slot/i })).toBeInTheDocument()
    })
  })

  describe('week navigation', () => {
    it('renders previous and next week buttons', () => {
      renderPage()

      expect(screen.getByRole('button', { name: /semana anterior/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /proxima semana/i })).toBeInTheDocument()
    })

    it('renders today button', () => {
      renderPage()

      expect(screen.getByRole('button', { name: /hoje/i })).toBeInTheDocument()
    })
  })

  describe('status filter', () => {
    it('renders status filter buttons', () => {
      renderPage()

      expect(screen.getByRole('button', { name: /todos/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /disponivel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /reservado/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelado/i })).toBeInTheDocument()
    })

    it('filters slots by status when clicked', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(screen.getByRole('button', { name: /disponivel/i }))

      const rows = screen.getAllByRole('row')
      const dataRows = rows.slice(1)
      expect(dataRows).toHaveLength(1)
    })
  })

  describe('slot list', () => {
    it('renders all slots with status badges', () => {
      renderPage()

      expect(screen.getAllByText('Disponivel').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Reservado').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Cancelado').length).toBeGreaterThanOrEqual(1)
    })

    it('shows team name for booked slots', () => {
      renderPage()

      expect(screen.getAllByText('Lero Lero').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('create slot dialog', () => {
    it('opens create dialog when button is clicked', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(screen.getByRole('button', { name: /criar slot/i }))

      expect(screen.getByRole('heading', { name: 'Criar Slot' })).toBeInTheDocument()
      expect(screen.getByLabelText(/inicio/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fim/i)).toBeInTheDocument()
    })
  })

  describe('delete slot', () => {
    it('opens confirm dialog when delete is clicked', async () => {
      const user = userEvent.setup()
      renderPage()

      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i })
      await user.click(deleteButtons[0])

      expect(screen.getByText(/tem certeza/i)).toBeInTheDocument()
    })
  })

  describe('edit slot', () => {
    it('opens edit dialog when edit is clicked', async () => {
      const user = userEvent.setup()
      renderPage()

      const editButtons = screen.getAllByRole('button', { name: /editar/i })
      await user.click(editButtons[0])

      expect(screen.getByText('Editar Slot')).toBeInTheDocument()
    })
  })
})
