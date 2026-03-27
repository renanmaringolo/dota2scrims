import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/hooks/useAuth'
import { useCalendarChannel } from '@/hooks/useCalendarChannel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AriaLiveAnnouncer from '@/components/shared/AriaLiveAnnouncer'
import { LogOut, Shield, Swords, WifiOff } from 'lucide-react'

interface HeaderProps {
  variant: 'public' | 'auth' | 'admin'
}

export default function Header({ variant }: HeaderProps) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { logout } = useAuth()
  const { connected, announcement } = useCalendarChannel()

  return (
    <header className="gradient-border bg-bg-secondary/80 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="group flex items-center gap-2.5" aria-label="Dota2Scrims home">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary-400/10 transition-colors group-hover:bg-primary-400/20">
              <Swords className="size-4 text-primary-400" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gradient-teal">
              Dota2Scrims
            </span>
          </Link>
          {variant === 'admin' && (
            <Badge className="border-primary-400/30 bg-primary-400/10 text-primary-400 gap-1">
              <Shield className="size-3" />
              Admin
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && !connected && (
            <span className="flex items-center gap-1.5 text-xs text-warning-400 animate-pulse">
              <WifiOff className="size-3" />
              Reconectando...
            </span>
          )}
          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline text-sm text-text-secondary truncate max-w-[200px]">{user?.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                aria-label="Sair da conta"
                className="gap-1.5 text-text-muted hover:text-danger-400"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </>
          ) : (
            variant === 'public' && (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-text-secondary hover:text-primary-400">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-primary-400/15 text-primary-400 hover:bg-primary-400/25 border border-primary-400/30"
                  >
                    Registre-se
                  </Button>
                </Link>
              </>
            )
          )}
        </div>
      </div>
      <AriaLiveAnnouncer message={announcement} />
    </header>
  )
}
