import { createConsumer } from '@rails/actioncable'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/cable'

export function createCableConsumer(token?: string | null) {
  const url = token ? `${WS_URL}?token=${token}` : WS_URL
  return createConsumer(url)
}
