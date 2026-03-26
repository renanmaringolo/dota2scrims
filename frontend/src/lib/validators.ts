import { z } from 'zod'
import { SERVERS } from '@/lib/constants'

export const loginSchema = z.object({
  email: z.email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter no minimo 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter no minimo 6 caracteres'),
  password_confirmation: z.string().min(6, 'Confirmacao deve ter no minimo 6 caracteres'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Senhas nao conferem',
  path: ['password_confirmation'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

export const teamSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio'),
  manager_name: z.string().min(1, 'Nome do manager e obrigatorio'),
  manager_email: z.string().email('Email invalido'),
  timezone: z.string().min(1, 'Timezone e obrigatorio'),
})

export type TeamFormData = z.infer<typeof teamSchema>

export const bookingSchema = z.object({
  team_id: z.coerce.number().positive('Selecione um time'),
  lobby_name: z.string().min(1, 'Nome do lobby e obrigatorio'),
  lobby_password: z.string().min(1, 'Senha do lobby e obrigatoria'),
  server_host: z.enum(SERVERS, { errorMap: () => ({ message: 'Servidor e obrigatorio' }) }),
})

export type BookingFormData = z.infer<typeof bookingSchema>

export const playerSchema = z.object({
  nickname: z.string().min(1, 'Nickname e obrigatorio'),
  role: z.string().min(1, 'Posicao e obrigatoria'),
  mmr: z.coerce.number().int().positive('MMR deve ser positivo'),
})

export type PlayerFormData = z.infer<typeof playerSchema>
