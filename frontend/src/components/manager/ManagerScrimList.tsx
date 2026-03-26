import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ManagerScrimCard from './ManagerScrimCard'
import { useScrims } from '@/hooks/useScrims'

export default function ManagerScrimList() {
  const navigate = useNavigate()
  const { managerScrimsQuery } = useScrims()

  if (managerScrimsQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  const scrims = managerScrimsQuery.data ?? []

  if (scrims.length === 0) {
    return (
      <EmptyState
        title="Nenhuma scrim agendada"
        description="Voce ainda nao agendou nenhuma scrim."
        action={
          <Button onClick={() => navigate('/')}>
            Agendar Scrim
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {scrims.map((scrim) => (
        <ManagerScrimCard key={scrim.id} scrim={scrim} />
      ))}
    </div>
  )
}
