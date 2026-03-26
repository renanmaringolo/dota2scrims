import { useFormContext } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SERVERS, SERVER_LABEL_MAP } from '@/lib/constants'

export default function LobbyFields() {
  const { control } = useFormContext()

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <FormField
        control={control}
        name="lobby_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Lobby</FormLabel>
            <FormControl>
              <Input placeholder="AVL-SCRIM" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="lobby_password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Senha do Lobby</FormLabel>
            <FormControl>
              <Input placeholder="senha123" className="font-mono" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="server_host"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Servidor</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SERVERS.map((server) => (
                  <SelectItem key={server} value={server}>
                    {SERVER_LABEL_MAP[server] ?? server}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
