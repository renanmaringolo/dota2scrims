import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-bg-secondary px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-400">Dota2Scrims Admin</h1>
        </div>
      </header>
      <div className="flex">
        <aside className="w-64 border-r border-border bg-bg-secondary p-4">
          <nav className="space-y-2">
            <span className="block text-sm text-text-muted">Admin Navigation</span>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
