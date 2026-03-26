import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@rails/actioncable', () => ({
  createConsumer: vi.fn((url: string) => ({ url, subscriptions: {} })),
}))

import { createConsumer } from '@rails/actioncable'
import { createCableConsumer } from './cable'

const mockCreateConsumer = vi.mocked(createConsumer)

describe('createCableConsumer', () => {
  beforeEach(() => {
    mockCreateConsumer.mockClear()
  })

  it('creates consumer with token in URL when token is provided', () => {
    createCableConsumer('test-jwt-token')

    expect(mockCreateConsumer).toHaveBeenCalledWith(
      'ws://localhost:3000/cable?token=test-jwt-token',
    )
  })

  it('creates consumer without token in URL when token is null', () => {
    createCableConsumer(null)

    expect(mockCreateConsumer).toHaveBeenCalledWith(
      'ws://localhost:3000/cable',
    )
  })

  it('creates consumer without token in URL when token is undefined', () => {
    createCableConsumer()

    expect(mockCreateConsumer).toHaveBeenCalledWith(
      'ws://localhost:3000/cable',
    )
  })
})
