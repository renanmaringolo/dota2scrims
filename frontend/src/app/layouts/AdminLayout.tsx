import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import Header from '@/components/shared/Header'
import SkipLink from '@/components/shared/SkipLink'
import { LayoutDashboard, Clock, Swords, Menu, X } from 'lucide-react'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/slots', label: 'Slots', icon: Clock, end: false },
  { to: '/admin/scrims', label: 'Scrims', icon: Swords, end: false },
]

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-3 min-h-11 text-sm transition-all duration-200 ${
    isActive
      ? 'bg-primary-400/10 text-primary-400 font-medium border border-primary-400/20'
      : 'text-text-muted hover:bg-bg-elevated hover:text-text-primary border border-transparent'
  }`

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={navLinkClasses}
          onClick={onNavigate}
        >
          <item.icon className="size-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background bg-grid-pattern text-foreground">
      <SkipLink />
      <Header variant="admin" />
      <div className="flex">
        <aside className="hidden md:block w-60 border-r border-border bg-bg-secondary/50 backdrop-blur-sm p-4">
          <SidebarNav />
        </aside>

        <div className="md:hidden fixed top-3 right-4 z-50">
          <button
            aria-label="Menu"
            onClick={() => setDrawerOpen(true)}
            className="p-2.5 min-h-11 min-w-11 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <Menu className="size-5" />
          </button>
        </div>

        {drawerOpen && (
          <>
            <div
              data-testid="drawer-backdrop"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <div
              data-testid="mobile-drawer"
              className="fixed inset-y-0 left-0 z-50 w-60 bg-bg-secondary border-r border-border p-4 md:hidden animate-in slide-in-from-left duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-text-primary">Menu</span>
                <button
                  aria-label="Close menu"
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 min-h-11 min-w-11 flex items-center justify-center rounded text-text-muted hover:text-text-primary"
                >
                  <X className="size-5" />
                </button>
              </div>
              <SidebarNav onNavigate={() => setDrawerOpen(false)} />
            </div>
          </>
        )}

        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
