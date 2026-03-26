import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, it, expect, beforeEach } from 'vitest'
import { renderWithProviders } from '@/tests/utils'
import { server } from '@/tests/mocks/server'
import AdminDashboard from './AdminDashboard'

const now = new Date()
const todaySlot = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0).toISOString()
const tomorrowSlot = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
const yesterdaySlot = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

const scrimsData = [
  {
    id: 1,
    status: 'scheduled',
    time_slot: { id: 10, starts_at: todaySlot, ends_at: todaySlot },
    team: { id: 2, name: 'Rock n Sports', mmr: 4500 },
    lobby_name: 'avalanche-vs-rns',
    server_host: 'br',
    created_at: yesterdaySlot,
  },
  {
    id: 2,
    status: 'scheduled',
    time_slot: { id: 11, starts_at: tomorrowSlot, ends_at: tomorrowSlot },
    team: { id: 3, name: 'Lero Lero Team', mmr: 4000 },
    lobby_name: 'avalanche-vs-llt',
    server_host: 'arg',
    created_at: yesterdaySlot,
  },
  {
    id: 3,
    status: 'completed',
    time_slot: { id: 12, starts_at: yesterdaySlot, ends_at: yesterdaySlot },
    team: { id: 4, name: 'Bla Bla Squad', mmr: 3800 },
    lobby_name: 'avalanche-vs-bbs',
    server_host: 'weu',
    created_at: yesterdaySlot,
  },
]

const slotsData = [
  { id: 10, starts_at: todaySlot, ends_at: todaySlot, status: 'booked' },
  { id: 11, starts_at: tomorrowSlot, ends_at: tomorrowSlot, status: 'booked' },
  { id: 13, starts_at: tomorrowSlot, ends_at: tomorrowSlot, status: 'available' },
  { id: 14, starts_at: yesterdaySlot, ends_at: yesterdaySlot, status: 'available' },
]

describe('AdminDashboard', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/admin/scrims', () => {
        return HttpResponse.json({ data: scrimsData, meta: { total: 3 } })
      }),
      http.get('/api/time_slots', () => {
        return HttpResponse.json({ data: slotsData })
      }),
    )
  })

  it('renders loading skeletons initially', () => {
    renderWithProviders(<AdminDashboard />)

    const skeletons = screen.getAllByTestId('stat-skeleton')
    expect(skeletons.length).toBeGreaterThanOrEqual(4)
  })

  it('renders stat cards after data loads', async () => {
    renderWithProviders(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Total de Scrims')).toBeInTheDocument()
    })

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Scrims Hoje')).toBeInTheDocument()
    expect(screen.getAllByText('Proximas Scrims').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Slots Disponiveis')).toBeInTheDocument()
    expect(screen.getByText('Total de Scrims')).toBeInTheDocument()
  })

  it('renders upcoming scrims list', async () => {
    renderWithProviders(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Proximas Scrims')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Rock n Sports')).toBeInTheDocument()
    })

    expect(screen.getByText('Lero Lero Team')).toBeInTheDocument()
  })

  it('renders quick action links', async () => {
    renderWithProviders(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /criar slot/i })).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /ver slots/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver scrims/i })).toBeInTheDocument()
  })
})
