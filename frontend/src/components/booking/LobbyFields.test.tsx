import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { screen } from '@testing-library/react'
import { renderWithProviders, userEvent } from '@/tests/utils'
import LobbyFields from './LobbyFields'

beforeAll(() => {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
  Element.prototype.scrollIntoView = () => {}
})

const testSchema = z.object({
  lobby_name: z.string().min(1),
  lobby_password: z.string().min(1),
  server_host: z.string().min(1),
})

type TestValues = z.infer<typeof testSchema>

function TestWrapper({ defaultValues }: { defaultValues?: Partial<TestValues> }) {
  const form = useForm<TestValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      lobby_name: '',
      lobby_password: '',
      server_host: '',
      ...defaultValues,
    },
  })

  return (
    <FormProvider {...form}>
      <LobbyFields />
    </FormProvider>
  )
}

describe('LobbyFields', () => {
  it('renders lobby name field', () => {
    renderWithProviders(<TestWrapper />)

    expect(screen.getByLabelText('Nome do Lobby')).toBeInTheDocument()
  })

  it('renders lobby password field with font-mono class', () => {
    renderWithProviders(<TestWrapper />)

    const input = screen.getByLabelText('Senha do Lobby')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('font-mono')
  })

  it('renders server host select field', () => {
    renderWithProviders(<TestWrapper />)

    expect(screen.getByText('Servidor')).toBeInTheDocument()
    expect(screen.getByText('Selecione')).toBeInTheDocument()
  })

  it('shows server options BR, ARG, WEU when select is opened', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestWrapper />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    expect(screen.getByText('BR')).toBeInTheDocument()
    expect(screen.getByText('ARG')).toBeInTheDocument()
    expect(screen.getByText('WEU')).toBeInTheDocument()
  })

  it('accepts user input in lobby name field', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestWrapper />)

    const input = screen.getByLabelText('Nome do Lobby')
    await user.type(input, 'AVL-SCRIM')

    expect(input).toHaveValue('AVL-SCRIM')
  })

  it('accepts user input in lobby password field', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestWrapper />)

    const input = screen.getByLabelText('Senha do Lobby')
    await user.type(input, 'senha123')

    expect(input).toHaveValue('senha123')
  })
})
