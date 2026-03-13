import { Outlet } from 'react-router-dom'
import Header from '@/components/shared/Header'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header variant="public" />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
