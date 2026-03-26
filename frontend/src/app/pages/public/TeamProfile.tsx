import { useParams } from 'react-router-dom'
import TeamProfileComponent from '@/components/team/TeamProfile'

export default function TeamProfile() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-4">
      <TeamProfileComponent teamId={Number(id)} />
    </div>
  )
}
