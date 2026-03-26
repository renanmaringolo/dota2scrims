import { useContext } from 'react'
import { CableContext } from '@/lib/cableContext'

export function useCable() {
  return useContext(CableContext)
}
