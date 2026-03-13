import { Outlet, NavLink } from 'react-router-dom'
import Header from '@/components/shared/Header'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm ${isActive ? 'bg-primary-500/10 text-primary-400 font-medium' : 'text-text-muted hover:bg-bg-secondary hover:text-text-primary'}`

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header variant="admin" />
      <div className="flex">
        <aside className="w-64 border-r border-border bg-bg-secondary p-4">
          <nav className="space-y-1">
            <NavLink to="/admin" end className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/admin/slots" className={navLinkClass}>Slots</NavLink>
            <NavLink to="/admin/scrims" className={navLinkClass}>Scrims</NavLink>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
