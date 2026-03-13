import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { loginSchema, type LoginFormData } from '@/lib/validators'
import type { ApiError } from '@/types/api'
import { useAuth } from '@/hooks/useAuth'
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

export default function LoginForm() {
  const { loginMutation } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const from = (location.state as { from?: string })?.from || '/dashboard'

  function onSubmit(data: LoginFormData) {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate(from, { replace: true })
      },
    })
  }

  const serverMessage =
    loginMutation.error && isAxiosError<ApiError>(loginMutation.error)
      ? loginMutation.error.response?.data?.error?.message
      : undefined

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverMessage && (
          <p className="text-sm text-destructive">{serverMessage}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Nao tem conta?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Registre-se
          </Link>
        </p>
      </form>
    </Form>
  )
}
