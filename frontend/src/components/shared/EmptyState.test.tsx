import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="Nenhum resultado" />)
    expect(screen.getByRole('heading', { name: 'Nenhum resultado' })).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="Vazio" description="Tente novamente mais tarde" />)
    expect(screen.getByText('Tente novamente mais tarde')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="Vazio" />)
    expect(container.querySelector('p')).not.toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(<EmptyState title="Vazio" icon={<span data-testid="icon">X</span>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders action when provided', () => {
    render(<EmptyState title="Vazio" action={<button>Criar</button>} />)
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument()
  })

  it('does not render action when not provided', () => {
    render(<EmptyState title="Vazio" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
