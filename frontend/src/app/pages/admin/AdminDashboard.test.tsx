import { expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { toHaveNoViolations } from 'vitest-axe/matchers'
import { waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/tests/utils'
import AdminDashboard from './AdminDashboard'

expect.extend({ toHaveNoViolations })

it('should have no accessibility violations', async () => {
  const { container } = renderWithProviders(<AdminDashboard />)
  await waitFor(() => {
    expect(container.querySelector('[data-testid="stat-skeleton"]')).not.toBeInTheDocument()
  })
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
