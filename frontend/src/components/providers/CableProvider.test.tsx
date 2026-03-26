import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useContext } from 'react'
import { CableContext } from '@/lib/cableContext'
import { CableProvider } from './CableProvider'

const mockDisconnect = vi.fn()
const mockConsumer = { subscriptions: {}, disconnect: mockDisconnect, connect: vi.fn() }

vi.mock('@/lib/cable', () => ({
  createCableConsumer: vi.fn(() => mockConsumer),
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn((selector: (s: { token: string | null }) => unknown) =>
    selector({ token: 'test-token' }),
  ),
}))

function ConsumerInspector() {
  const { consumer } = useContext(CableContext)
  return <div data-testid="has-consumer">{consumer ? 'yes' : 'no'}</div>
}

describe('CableProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children', () => {
    render(
      <CableProvider>
        <span>child content</span>
      </CableProvider>,
    )

    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('provides consumer via context', () => {
    render(
      <CableProvider>
        <ConsumerInspector />
      </CableProvider>,
    )

    expect(screen.getByTestId('has-consumer')).toHaveTextContent('yes')
  })
})
