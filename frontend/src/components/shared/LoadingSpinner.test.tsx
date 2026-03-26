import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with role="status"', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders with aria-label="Carregando"', () => {
    render(<LoadingSpinner />)
    expect(screen.getByLabelText('Carregando')).toBeInTheDocument()
  })

  it('applies sm size (h-4 w-4)', () => {
    render(<LoadingSpinner size="sm" />)
    const spinner = screen.getByRole('status')
    expect(spinner.className).toMatch(/h-4/)
    expect(spinner.className).toMatch(/w-4/)
  })

  it('applies md size by default (h-8 w-8)', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner.className).toMatch(/h-8/)
    expect(spinner.className).toMatch(/w-8/)
  })

  it('applies lg size (h-12 w-12)', () => {
    render(<LoadingSpinner size="lg" />)
    const spinner = screen.getByRole('status')
    expect(spinner.className).toMatch(/h-12/)
    expect(spinner.className).toMatch(/w-12/)
  })

  it('accepts custom className', () => {
    render(<LoadingSpinner className="text-primary" />)
    const spinner = screen.getByRole('status')
    expect(spinner.className).toMatch(/text-primary/)
  })
})
