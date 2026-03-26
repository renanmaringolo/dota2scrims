import { Outlet, NavLink } from 'react-router-dom'
import Header from '@/components/shared/Header'
import { LayoutDashboard, Clock, Swords } from 'lucide-react'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/slots', label: 'Slots', icon: Clock, end: false },
  { to: '/admin/scrims', label: 'Scrims', icon: Swords, end: false },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background bg-grid-pattern text-foreground">
      <Header variant="admin" />
      <div className="flex">
        <aside className="w-60 border-r border-border bg-bg-secondary/50 backdrop-blur-sm p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-400/10 text-primary-400 font-medium border border-primary-400/20'
                      : 'text-text-muted hover:bg-bg-elevated hover:text-text-primary border border-transparent'
                  }`
                }
              >
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
