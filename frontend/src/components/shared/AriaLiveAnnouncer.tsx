interface AriaLiveAnnouncerProps {
  message: string
}

export default function AriaLiveAnnouncer({ message }: AriaLiveAnnouncerProps) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  )
}
