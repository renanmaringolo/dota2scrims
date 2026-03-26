import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useCable } from '@/hooks/useCable'

interface TimeSlotEvent {
  event: 'slot_created' | 'slot_booked' | 'slot_cancelled'
  data: {
    id: number
    starts_at: string
    ends_at: string
    status: 'available' | 'booked' | 'cancelled'
  }
}

export function useCalendarChannel() {
  const { consumer } = useCable()
  const queryClient = useQueryClient()
  const [connected, setConnected] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (!consumer) return

    const subscription = consumer.subscriptions.create('ScrimChannel', {
      connected() {
        setConnected(true)
        if (pollingRef.current) clearInterval(pollingRef.current)
        queryClient.invalidateQueries({ queryKey: ['time-slots'] })
      },
      disconnected() {
        setConnected(false)
        pollingRef.current = setInterval(() => {
          queryClient.invalidateQueries({ queryKey: ['time-slots'] })
        }, 30_000)
      },
      received(_message: TimeSlotEvent) {
        queryClient.invalidateQueries({ queryKey: ['time-slots'] })
      },
    })

    return () => {
      subscription.unsubscribe()
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [consumer, queryClient])

  return { connected }
}
