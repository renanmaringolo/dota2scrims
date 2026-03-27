import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AriaLiveAnnouncer from './AriaLiveAnnouncer'

describe('AriaLiveAnnouncer', () => {
  it('renders an aria-live region with polite politeness', () => {
    render(<AriaLiveAnnouncer message="" />)
    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-live', 'polite')
  })

  it('displays the message text', () => {
    render(<AriaLiveAnnouncer message="Slot atualizado: 20:00 - 22:00 agora está disponível" />)
    expect(screen.getByRole('status')).toHaveTextContent('Slot atualizado: 20:00 - 22:00 agora está disponível')
  })

  it('is visually hidden but accessible', () => {
    render(<AriaLiveAnnouncer message="teste" />)
    const region = screen.getByRole('status')
    expect(region.className).toContain('sr-only')
  })
})
