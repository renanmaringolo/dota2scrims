import TeamList from '@/components/team/TeamList'

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Painel do Manager</h2>
        <p className="text-text-secondary">Gerencie seus times e scrims agendadas.</p>
      </div>
      <TeamList />
    </div>
  )
}
