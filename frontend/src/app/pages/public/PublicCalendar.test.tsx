import { expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { toHaveNoViolations } from 'vitest-axe/matchers'
import { renderWithProviders } from '@/tests/utils'
import PublicCalendar from './PublicCalendar'

expect.extend({ toHaveNoViolations })

it('should have no accessibility violations', async () => {
  const { container } = renderWithProviders(<PublicCalendar />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
