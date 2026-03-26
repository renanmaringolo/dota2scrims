import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTeams } from '@/hooks/useTeams'

interface TeamSelectorProps {
  value?: number
  onChange: (teamId: number) => void
}

export default function TeamSelector({ value, onChange }: TeamSelectorProps) {
  const { teamsQuery } = useTeams()
  const teams = teamsQuery.data ?? []

  return (
    <Select
      value={value?.toString()}
      onValueChange={(val) => onChange(Number(val))}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione um time" />
      </SelectTrigger>
      <SelectContent>
        {teams.map((team) => (
          <SelectItem key={team.id} value={team.id.toString()}>
            {team.name} ({team.mmr} MMR)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
