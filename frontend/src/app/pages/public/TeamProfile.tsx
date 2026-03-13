import { useParams } from 'react-router-dom'

export default function TeamProfile() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-text-primary">Team Profile</h2>
      <p className="text-text-secondary">Team #{id}</p>
    </div>
  )
}
