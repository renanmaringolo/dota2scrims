import { useSyncExternalStore } from 'react'

const MD_BREAKPOINT = 768
const QUERY = `(max-width: ${MD_BREAKPOINT - 1}px)`

function subscribe(callback: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {}

  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getSnapshot() {
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot() {
  return false
}

export default function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
