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
import { teamSchema, type TeamFormData } from '@/lib/validators'
import { TIMEZONES } from '@/lib/constants'
import { useTeams } from '@/hooks/useTeams'
import type { ApiError } from '@/types/api'
import type { AxiosError } from 'axios'

export default function TeamCreateForm() {
  const navigate = useNavigate()
  const { createTeamMutation } = useTeams()
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      manager_name: '',
      manager_email: '',
      timezone: '',
    },
  })

  const onSubmit = async (data: TeamFormData) => {
    setApiError(null)
    try {
      await createTeamMutation.mutateAsync(data)
      navigate('/dashboard')
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      setApiError(axiosError.response?.data?.error?.message ?? 'Erro ao criar time')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {apiError && (
          <p className="text-sm text-destructive">{apiError}</p>
        )}

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

        <Button type="submit" className="w-full" disabled={createTeamMutation.isPending}>
          {createTeamMutation.isPending ? 'Criando...' : 'Criar Time'}
        </Button>
      </form>
    </Form>
  )
}
