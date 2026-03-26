import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

function ThrowingComponent({ message }: { message: string }) {
  throw new Error(message)
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>Conteudo normal</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('Conteudo normal')).toBeInTheDocument()
  })

  it('renders default fallback when children throws error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="Erro de teste" />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument()
  })

  it('displays error message in default fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="Falha critica" />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Falha critica')).toBeInTheDocument()
  })

  it('renders custom fallback when fallback prop is provided', () => {
    render(
      <ErrorBoundary fallback={<div>Fallback customizado</div>}>
        <ThrowingComponent message="Erro" />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Fallback customizado')).toBeInTheDocument()
    expect(screen.queryByText('Algo deu errado')).not.toBeInTheDocument()
  })

  it('shows "Tentar novamente" button in default fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="Erro" />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })
})
