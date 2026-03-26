import { Link } from 'react-router-dom'
import TeamCreateForm from '@/components/team/TeamCreateForm'

export default function TeamNew() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-1">
        <nav className="text-sm text-text-secondary">
          <Link to="/dashboard" className="hover:text-text-primary">
            Dashboard
          </Link>
          {' > '}
          <span className="text-text-primary">Novo Time</span>
        </nav>
        <h2 className="text-2xl font-bold text-text-primary">Criar Time</h2>
      </div>
      <TeamCreateForm />
    </div>
  )
}
