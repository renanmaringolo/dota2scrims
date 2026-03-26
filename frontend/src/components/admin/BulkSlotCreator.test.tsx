import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BulkSlotCreator from './BulkSlotCreator'

const mockBulkCreate = vi.fn()

vi.mock('@/hooks/useAdminSlots', () => ({
  useBulkCreateSlots: () => ({
    mutateAsync: mockBulkCreate,
    isPending: false,
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function renderComponent(props: { open: boolean; onOpenChange?: (open: boolean) => void }) {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <BulkSlotCreator open={props.open} onOpenChange={props.onOpenChange ?? vi.fn()} />
    </QueryClientProvider>,
  )
}

describe('BulkSlotCreator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when closed', () => {
    renderComponent({ open: false })

    expect(screen.queryByText('Criar Slots em Lote')).not.toBeInTheDocument()
  })

  it('renders dialog title when open', () => {
    renderComponent({ open: true })

    expect(screen.getByRole('heading', { name: /criar slots em lote/i })).toBeInTheDocument()
  })

  describe('day selection', () => {
    it('renders all weekday buttons', () => {
      renderComponent({ open: true })

      expect(screen.getByRole('button', { name: /seg/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /ter/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /qua/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /qui/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sex/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sab/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /dom/i })).toBeInTheDocument()
    })
  })

  describe('date range', () => {
    it('renders date range inputs', () => {
      renderComponent({ open: true })

      expect(screen.getByLabelText(/data inicio/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/data fim/i)).toBeInTheDocument()
    })
  })

  describe('time slots', () => {
    it('renders time input fields and add button', () => {
      renderComponent({ open: true })

      expect(screen.getByLabelText(/hora inicio/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/hora fim/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /adicionar horario/i })).toBeInTheDocument()
    })

    it('adds a time entry when add button is clicked', async () => {
      const user = userEvent.setup()
      renderComponent({ open: true })

      const startInput = screen.getByLabelText(/hora inicio/i)
      const endInput = screen.getByLabelText(/hora fim/i)

      await user.clear(startInput)
      await user.type(startInput, '19:00')
      await user.clear(endInput)
      await user.type(endInput, '20:00')
      await user.click(screen.getByRole('button', { name: /adicionar horario/i }))

      expect(screen.getByText('19:00 - 20:00')).toBeInTheDocument()
    })

    it('removes a time entry when remove is clicked', async () => {
      const user = userEvent.setup()
      renderComponent({ open: true })

      const startInput = screen.getByLabelText(/hora inicio/i)
      const endInput = screen.getByLabelText(/hora fim/i)

      await user.clear(startInput)
      await user.type(startInput, '19:00')
      await user.clear(endInput)
      await user.type(endInput, '20:00')
      await user.click(screen.getByRole('button', { name: /adicionar horario/i }))

      expect(screen.getByText('19:00 - 20:00')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /remover/i }))
      expect(screen.queryByText('19:00 - 20:00')).not.toBeInTheDocument()
    })
  })

  describe('preview and submit', () => {
    async function fillBulkForm(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('button', { name: /seg/i }))

      fireEvent.change(screen.getByLabelText(/data inicio/i), { target: { value: '2026-03-30' } })
      fireEvent.change(screen.getByLabelText(/data fim/i), { target: { value: '2026-04-05' } })

      fireEvent.change(screen.getByLabelText(/hora inicio/i), { target: { value: '19:00' } })
      fireEvent.change(screen.getByLabelText(/hora fim/i), { target: { value: '20:00' } })
      await user.click(screen.getByRole('button', { name: /adicionar horario/i }))
    }

    it('shows preview count when days, dates and times are set', async () => {
      const user = userEvent.setup()
      renderComponent({ open: true })

      await fillBulkForm(user)

      expect(screen.getByText(/criar 1 slot/i)).toBeInTheDocument()
    })

    it('calls bulk create with correct params on submit', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      mockBulkCreate.mockResolvedValueOnce([])
      renderComponent({ open: true, onOpenChange })

      await fillBulkForm(user)

      await user.click(screen.getByText(/criar 1 slot/i))

      expect(mockBulkCreate).toHaveBeenCalledTimes(1)
      expect(mockBulkCreate).toHaveBeenCalledWith([
        {
          starts_at: '2026-03-30T19:00:00.000Z',
          ends_at: '2026-03-30T20:00:00.000Z',
        },
      ])
    })
  })
})
