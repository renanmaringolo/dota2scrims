import { z } from 'zod'

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
