import LoginForm from '@/components/auth/LoginForm'
import { Swords } from 'lucide-react'

export default function Login() {
  return (
    <div>
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl border border-primary-400/20 bg-primary-400/10 lg:hidden">
          <Swords className="size-5 text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Bem-vindo de volta
        </h1>
        <p className="text-sm text-text-muted">
          Entre para gerenciar seus scrims
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
