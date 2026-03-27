import { describe, it, expect } from 'vitest'
import { renderWithProviders, userEvent } from '@/tests/utils'
import SkipLink from './SkipLink'

describe('SkipLink', () => {
  it('renders a link targeting #main-content', () => {
    const { getByText } = renderWithProviders(<SkipLink />)
    const link = getByText('Pular para o conteúdo principal')
    expect(link).toHaveAttribute('href', '#main-content')
  })

  it('has sr-only and focus:not-sr-only classes for show-on-focus behavior', () => {
    const { getByText } = renderWithProviders(<SkipLink />)
    const link = getByText('Pular para o conteúdo principal')
    expect(link.className).toContain('sr-only')
    expect(link.className).toContain('focus:not-sr-only')
  })

  it('receives focus on first tab press', async () => {
    const { getByText } = renderWithProviders(<SkipLink />)
    const link = getByText('Pular para o conteúdo principal')
    await userEvent.setup().tab()
    expect(link).toHaveFocus()
  })
})
