import { useParams } from 'react-router-dom'

export default function TeamEdit() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-text-primary">Edit Team</h2>
      <p className="text-text-secondary">Update team #{id} details.</p>
    </div>
  )
}
