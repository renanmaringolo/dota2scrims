import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/tests/utils'
import ConfirmDialog from './ConfirmDialog'

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  title: 'Confirmar acao',
  description: 'Tem certeza que deseja continuar?',
  onConfirm: vi.fn(),
}

describe('ConfirmDialog', () => {
  it('renders title and description when open', () => {
    renderWithProviders(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('Confirmar acao')).toBeInTheDocument()
    expect(screen.getByText('Tem certeza que deseja continuar?')).toBeInTheDocument()
  })

  it('calls onConfirm when clicking confirm button', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onOpenChange(false) when clicking cancel', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows custom confirmLabel', () => {
    renderWithProviders(<ConfirmDialog {...defaultProps} confirmLabel="Excluir" />)
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument()
  })

  it('shows custom cancelLabel', () => {
    renderWithProviders(<ConfirmDialog {...defaultProps} cancelLabel="Voltar" />)
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument()
  })

  it('disables confirm button when loading', () => {
    renderWithProviders(<ConfirmDialog {...defaultProps} loading />)
    expect(screen.getByRole('button', { name: /Confirmar/i })).toBeDisabled()
  })

  it('shows "..." on button when loading', () => {
    renderWithProviders(<ConfirmDialog {...defaultProps} loading />)
    expect(screen.getByRole('button', { name: /Confirmar\.\.\./i })).toBeInTheDocument()
  })

  it('applies destructive variant to confirm button', () => {
    renderWithProviders(<ConfirmDialog {...defaultProps} variant="destructive" confirmLabel="Excluir" />)
    const button = screen.getByRole('button', { name: 'Excluir' })
    expect(button.dataset.variant).toBe('destructive')
  })
})
