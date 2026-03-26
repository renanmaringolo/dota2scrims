import { createContext } from 'react'
import type { Consumer } from '@rails/actioncable'

export interface CableContextType {
  consumer: Consumer | null
}

export const CableContext = createContext<CableContextType>({ consumer: null })
