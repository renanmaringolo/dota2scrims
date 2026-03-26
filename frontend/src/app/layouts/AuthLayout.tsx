import { Outlet } from 'react-router-dom'
import { Swords, Calendar, Users, Zap } from 'lucide-react'

const features = [
  { icon: Calendar, text: 'Agende scrims em segundos' },
  { icon: Users, text: 'Gerencie seu time completo' },
  { icon: Zap, text: 'Notificacoes em tempo real' },
]

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-1/2 items-center justify-center bg-grid-pattern lg:flex">
        <div className="relative flex flex-col items-center px-12">
          <div className="absolute -top-32 size-64 rounded-full bg-primary-400/5 blur-3xl" />
          <div className="relative flex flex-col items-center">
            <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-primary-400/20 bg-primary-400/10">
              <Swords className="size-8 text-primary-400" />
            </div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-gradient-teal">
              Dota2Scrims
            </h1>
            <p className="mb-10 text-center text-lg text-text-secondary">
              Plataforma de agendamento de scrims<br />
              da Avalanche eSports
            </p>
            <div className="space-y-4">
              {features.map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-primary-400/20 bg-primary-400/5">
                    <f.icon className="size-4 text-primary-400" />
                  </div>
                  <span className="text-sm text-text-secondary">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-md rounded-2xl border border-border-bright bg-bg-secondary/50 p-8 backdrop-blur-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
