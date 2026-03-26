import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { registerSchema, type RegisterFormData } from '@/lib/validators'
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

export default function RegisterForm() {
  const { registerMutation } = useAuth()
  const navigate = useNavigate()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      password_confirmation: '',
    },
  })

  function onSubmit(data: RegisterFormData) {
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate('/dashboard')
      },
    })
  }

  const serverMessage =
    registerMutation.error && isAxiosError<ApiError>(registerMutation.error)
      ? registerMutation.error.response?.data?.error?.message
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

        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Senha</FormLabel>
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
          className="w-full bg-primary-400 text-bg-primary font-semibold hover:bg-primary-300 transition-all hover:shadow-[0_0_20px_rgba(102,252,241,0.3)]"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? 'Criando...' : 'Criar Conta'}
        </Button>

        <p className="text-center text-sm text-text-muted">
          Ja tem conta?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 transition-colors">
            Faca login
          </Link>
        </p>
      </form>
    </Form>
  )
}
