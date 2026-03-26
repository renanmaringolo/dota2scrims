import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { bookingSchema, type BookingFormData } from '@/lib/validators'
import { useScrims } from '@/hooks/useScrims'
import type { TimeSlot } from '@/types/models'
import type { ApiError } from '@/types/api'
import type { AxiosError } from 'axios'
import TeamSelector from '@/components/team/TeamSelector'
import LobbyFields from './LobbyFields'

interface BookingFormProps {
  slot: TimeSlot
  onSuccess: () => void
}

export default function BookingForm({ slot, onSuccess }: BookingFormProps) {
  const { createScrimMutation } = useScrims()
  const [apiError, setApiError] = useState<string | null>(null)

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      team_id: 0,
      lobby_name: '',
      lobby_password: '',
      server_host: '',
    },
  })

  const handleSubmit = async (data: BookingFormData) => {
    setApiError(null)
    try {
      await createScrimMutation.mutateAsync({ ...data, time_slot_id: slot.id })
      toast.success('Scrim agendada com sucesso!')
      onSuccess()
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>
      const status = axiosError.response?.status
      const message = axiosError.response?.data?.error?.message

      if (status === 409) {
        toast.error('Este slot ja foi agendado por outro time')
      } else if (status && status >= 500) {
        toast.error('Erro interno, tente novamente')
      } else {
        setApiError(message ?? 'Erro ao agendar scrim')
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {apiError && (
          <p className="text-sm text-destructive">{apiError}</p>
        )}

        <FormField
          control={form.control}
          name="team_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Adversario</FormLabel>
              <FormControl>
                <TeamSelector
                  value={field.value || undefined}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LobbyFields />

        <Button type="submit" className="w-full" disabled={createScrimMutation.isPending}>
          {createScrimMutation.isPending ? 'Agendando...' : 'Agendar Scrim'}
        </Button>
      </form>
    </Form>
  )
}
