import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { teamSchema, type TeamFormData } from '@/lib/validators'
import { TIMEZONES, PLAYER_ROLE_MAP } from '@/lib/constants'
import { useTeams } from '@/hooks/useTeams'
import type { Team } from '@/types/models'
import type { ApiError } from '@/types/api'
import type { AxiosError } from 'axios'

interface TeamEditFormProps {
  team: Team
}

export default function TeamEditForm({ team }: TeamEditFormProps) {
  const navigate = useNavigate()
  const { updateTeamMutation } = useTeams()
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team.name,
      manager_name: team.manager_name,
      manager_email: team.manager_email,
      timezone: team.timezone,
    },
  })

  const onSubmit = async (data: TeamFormData) => {
    setApiError(null)
    try {
      await updateTeamMutation.mutateAsync({ id: team.id, data })
      navigate(`/teams/${team.id}`)
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      setApiError(axiosError.response?.data?.error?.message ?? 'Erro ao atualizar time')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {apiError && (
          <p className="text-sm text-destructive">{apiError}</p>
        )}

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Time</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="manager_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Manager</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="manager_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {team.players.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-primary">Roster</h3>
            <div className="space-y-2">
              {team.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{player.nickname}</span>
                    <Badge variant="secondary">
                      {PLAYER_ROLE_MAP[player.role] ?? player.role}
                    </Badge>
                    <span className="text-sm text-text-secondary">{player.mmr} MMR</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button type="submit" disabled={updateTeamMutation.isPending}>
          {updateTeamMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </Form>
  )
}
