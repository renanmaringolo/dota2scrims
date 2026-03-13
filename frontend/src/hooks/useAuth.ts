import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/types/models'
import type { ApiResponse } from '@/types/api'

interface LoginParams {
  email: string
  password: string
}

interface RegisterParams {
  email: string
  password: string
  password_confirmation: string
}

type AuthResponse = ApiResponse<User> & { meta: { token: string } }

export function useAuth() {
  const { user, isAuthenticated, isAdmin, login: storeLogin, logout: storeLogout } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: async (params: LoginParams) => {
      const { data } = await api.post<AuthResponse>('/auth/login', {
        user: params,
      })
      return data
    },
    onSuccess: (response) => {
      storeLogin(response.data, response.meta.token)
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (params: RegisterParams) => {
      const { data } = await api.post<AuthResponse>('/auth/register', {
        user: params,
      })
      return data
    },
    onSuccess: (response) => {
      storeLogin(response.data, response.meta.token)
    },
  })

  const logout = () => {
    storeLogout()
    api.delete('/auth/logout').catch(() => {})
  }

  return {
    loginMutation,
    registerMutation,
    logout,
    user,
    isAuthenticated,
    isAdmin,
  }
}
