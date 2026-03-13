import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, it, expect, beforeEach } from 'vitest'
import React from 'react'
import { useAuth } from './useAuth'
import { useAuthStore } from '@/stores/authStore'
import { server } from '@/tests/mocks/server'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useAuth', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  describe('loginMutation', () => {
    it('saves user and token to authStore on success', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.loginMutation.mutateAsync({
          email: 'admin@avalanche.gg',
          password: 'password',
        })
      })

      const state = useAuthStore.getState()
      expect(state.user).toEqual({
        id: 1,
        email: 'admin@avalanche.gg',
        name: 'Admin',
        role: 'admin',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      })
      expect(state.token).toBe('fake-jwt-token')
      expect(state.isAuthenticated).toBe(true)
    })

    it('rejects with error on invalid credentials', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      await expect(
        act(async () => {
          await result.current.loginMutation.mutateAsync({
            email: 'wrong@email.com',
            password: 'wrong',
          })
        }),
      ).rejects.toThrow()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
    })
  })

  describe('registerMutation', () => {
    it('saves user and token to authStore on success (auto-login)', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.registerMutation.mutateAsync({
          email: 'manager@team.com',
          password: 'password123',
          password_confirmation: 'password123',
        })
      })

      const state = useAuthStore.getState()
      expect(state.user).toEqual({
        id: 2,
        email: 'manager@team.com',
        name: 'Lero Lero',
        role: 'manager',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      })
      expect(state.token).toBe('fake-register-token')
      expect(state.isAuthenticated).toBe(true)
    })

    it('rejects with error on validation failure', async () => {
      server.use(
        http.post('/api/auth/register', () => {
          return HttpResponse.json(
            {
              error: {
                status: 422,
                status_text: 'Unprocessable Entity',
                code: 'validation_error',
                message: 'Email has already been taken',
              },
            },
            { status: 422 },
          )
        }),
      )

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      await expect(
        act(async () => {
          await result.current.registerMutation.mutateAsync({
            email: 'existing@email.com',
            password: 'password123',
            password_confirmation: 'password123',
          })
        }),
      ).rejects.toThrow()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
    })
  })

  describe('logout', () => {
    it('clears authStore immediately', async () => {
      useAuthStore.getState().login(
        {
          id: 1,
          email: 'admin@avalanche.gg',
          name: 'Admin',
          role: 'admin',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        'fake-jwt-token',
      )

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      act(() => {
        result.current.logout()
      })

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('state accessors', () => {
    it('reflects authStore state for user, isAuthenticated, isAdmin', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isAdmin).toBe(false)

      act(() => {
        useAuthStore.getState().login(
          {
            id: 1,
            email: 'admin@avalanche.gg',
            name: 'Admin',
            role: 'admin',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
          'fake-jwt-token',
        )
      })

      await waitFor(() => {
        expect(result.current.user).not.toBeNull()
      })

      expect(result.current.user?.email).toBe('admin@avalanche.gg')
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isAdmin).toBe(true)
    })
  })
})
