import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  variant: 'public' | 'auth' | 'admin'
}

export default function Header({ variant }: HeaderProps) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { logout } = useAuth()

  return (
    <header className="border-b border-border bg-bg-secondary px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold text-primary-400">Dota2Scrims</Link>
          {variant === 'admin' && <Badge variant="secondary">Admin</Badge>}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-text-muted">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={logout}>Sair</Button>
            </>
          ) : (
            variant === 'public' && (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                <Link to="/register"><Button variant="default" size="sm">Registre-se</Button></Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  )
}
