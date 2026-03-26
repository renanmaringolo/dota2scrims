import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminScrims from './AdminScrims'
import type { Scrim } from '@/types'

const mockScrims: Scrim[] = [
  {
    id: 1,
    status: 'scheduled',
    time_slot: {
      id: 10,
      starts_at: '2026-03-26T19:00:00Z',
      ends_at: '2026-03-26T20:00:00Z',
    },
    team: { id: 1, name: 'Lero Lero', mmr: 4500 },
    server_host: 'br',
    lobby_name: 'lobby-1',
    created_at: '2026-03-25T10:00:00Z',
  },
  {
    id: 2,
    status: 'completed',
    time_slot: {
      id: 11,
      starts_at: '2026-03-25T20:00:00Z',
      ends_at: '2026-03-25T21:00:00Z',
    },
    team: { id: 2, name: 'Bla Bla', mmr: 3800 },
    server_host: 'arg',
    created_at: '2026-03-24T10:00:00Z',
  },
  {
    id: 3,
    status: 'cancelled',
    time_slot: {
      id: 12,
      starts_at: '2026-03-24T21:00:00Z',
      ends_at: '2026-03-24T22:00:00Z',
    },
    team: { id: 3, name: 'Rock n Sports' },
    server_host: 'weu',
    cancellation_reason: 'Time indisponivel',
    cancelled_at: '2026-03-24T18:00:00Z',
    created_at: '2026-03-23T10:00:00Z',
  },
]

vi.mock('@/hooks/useAdminScrims', () => ({
  useAdminScrimsList: (status?: string) => ({
    data: status
      ? mockScrims.filter((s) => s.status === status)
      : mockScrims,
    isLoading: false,
    error: null,
  }),
  useAdminScrimDetail: () => ({
    data: null,
    isLoading: false,
  }),
  useUpdateAdminScrim: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useCancelAdminScrim: () => ({
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
        <AdminScrims />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AdminScrims', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('header', () => {
    it('renders page title with scrim count', () => {
      renderPage()

      expect(screen.getByText('Scrims')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('status filter tabs', () => {
    it('renders all status filter tabs', () => {
      renderPage()

      expect(screen.getByRole('button', { name: /todas/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /scheduled/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancelled/i })).toBeInTheDocument()
    })

    it('filters scrims by status when tab is clicked', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(screen.getByRole('button', { name: /scheduled/i }))

      expect(screen.getAllByText('Lero Lero').length).toBeGreaterThan(0)
      expect(screen.queryByText('Bla Bla')).not.toBeInTheDocument()
      expect(screen.queryByText('Rock n Sports')).not.toBeInTheDocument()
    })
  })

  describe('search', () => {
    it('renders search input', () => {
      renderPage()

      expect(screen.getByPlaceholderText(/buscar por time/i)).toBeInTheDocument()
    })

    it('filters scrims by team name', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.type(screen.getByPlaceholderText(/buscar por time/i), 'Lero')

      expect(screen.getAllByText('Lero Lero').length).toBeGreaterThan(0)
      expect(screen.queryByText('Bla Bla')).not.toBeInTheDocument()
    })
  })

  describe('scrim table', () => {
    it('renders table headers', () => {
      renderPage()

      expect(screen.getByText('Data/Horario')).toBeInTheDocument()
      expect(screen.getByText('Time')).toBeInTheDocument()
      expect(screen.getByText('MMR')).toBeInTheDocument()
      expect(screen.getByText('Servidor')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('renders scrim data in table rows', () => {
      renderPage()

      const table = screen.getByRole('table')
      expect(within(table).getByText('Lero Lero')).toBeInTheDocument()
      expect(within(table).getByText('Bla Bla')).toBeInTheDocument()
      expect(within(table).getByText('Rock n Sports')).toBeInTheDocument()
    })

    it('displays server labels in uppercase', () => {
      renderPage()

      const table = screen.getByRole('table')
      expect(within(table).getByText('BR')).toBeInTheDocument()
      expect(within(table).getByText('ARG')).toBeInTheDocument()
      expect(within(table).getByText('WEU')).toBeInTheDocument()
    })

    it('displays status badges', () => {
      renderPage()

      const table = screen.getByRole('table')
      expect(within(table).getByText('Scheduled')).toBeInTheDocument()
      expect(within(table).getByText('Completed')).toBeInTheDocument()
      expect(within(table).getByText('Cancelled')).toBeInTheDocument()
    })

    it('renders details button for each scrim', () => {
      renderPage()

      const detailButtons = screen.getAllByRole('button', { name: /detalhes/i })
      expect(detailButtons.length).toBeGreaterThanOrEqual(3)
    })

    it('displays MMR when available', () => {
      renderPage()

      const table = screen.getByRole('table')
      expect(within(table).getByText('4500')).toBeInTheDocument()
      expect(within(table).getByText('3800')).toBeInTheDocument()
    })

    it('displays dash when MMR is not available', () => {
      renderPage()

      const rows = screen.getAllByRole('row')
      const rockRow = rows.find((row) => within(row).queryByText('Rock n Sports'))
      expect(rockRow).toBeTruthy()
      expect(within(rockRow!).getByText('-')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty state when no scrims match', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.type(screen.getByPlaceholderText(/buscar por time/i), 'Inexistente')

      expect(screen.getByText(/nenhuma scrim encontrada/i)).toBeInTheDocument()
    })
  })
})
