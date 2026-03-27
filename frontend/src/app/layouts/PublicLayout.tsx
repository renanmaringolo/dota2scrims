import { Outlet } from 'react-router-dom'
import Header from '@/components/shared/Header'
import SkipLink from '@/components/shared/SkipLink'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background bg-grid-pattern text-foreground">
      <SkipLink />
      <Header variant="public" />
      <main id="main-content" className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
