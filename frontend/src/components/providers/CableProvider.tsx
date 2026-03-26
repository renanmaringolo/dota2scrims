import { useEffect, useMemo } from 'react'
import { createCableConsumer } from '@/lib/cable'
import { CableContext } from '@/lib/cableContext'
import { useAuthStore } from '@/stores/authStore'

export function CableProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const consumer = useMemo(() => createCableConsumer(token), [token])

  useEffect(() => {
    return () => {
      consumer?.disconnect()
    }
  }, [consumer])

  return (
    <CableContext.Provider value={{ consumer }}>
      {children}
    </CableContext.Provider>
  )
}
