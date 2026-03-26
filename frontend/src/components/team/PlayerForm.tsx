import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
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
import { playerSchema, type PlayerFormData } from '@/lib/validators'
import { PLAYER_ROLES, PLAYER_ROLE_MAP } from '@/lib/constants'
import { usePlayers } from '@/hooks/usePlayers'
import type { Player } from '@/types/models'

interface PlayerFormProps {
  teamId: number
  player?: Player
  onSuccess: () => void
  onCancel: () => void
}

export default function PlayerForm({ teamId, player, onSuccess, onCancel }: PlayerFormProps) {
  const { addPlayerMutation, updatePlayerMutation } = usePlayers(teamId)
  const isEditing = !!player

  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      nickname: player?.nickname ?? '',
      role: player?.role ?? '',
      mmr: player?.mmr ?? ('' as unknown as number),
    },
  })

  const isPending = addPlayerMutation.isPending || updatePlayerMutation.isPending
  const selectedRole = form.watch('role')
  const isCoach = selectedRole === 'coach'

  const onSubmit = async (data: PlayerFormData) => {
    const payload = data.role === 'coach' ? { ...data, mmr: 0 } : data
    try {
      if (isEditing) {
        await updatePlayerMutation.mutateAsync({ id: player.id, data: payload })
        toast.success('Jogador atualizado')
      } else {
        await addPlayerMutation.mutateAsync(payload)
        toast.success('Jogador adicionado')
      }
      onSuccess()
    } catch {
      toast.error('Erro ao salvar jogador')
    }
  }

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit(onSubmit)()
  }

  return (
    <Form {...form}>
      <div className="space-y-4 rounded-lg border border-border p-4">
        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nickname</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Posicao</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PLAYER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {PLAYER_ROLE_MAP[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isCoach && (
          <FormField
            control={form.control}
            name="mmr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MMR</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-2">
          <Button type="button" disabled={isPending} onClick={handleSave}>
            {isPending ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </Form>
  )
}
