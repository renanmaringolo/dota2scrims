import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from './authStore'
import type { User } from '@/types/models'

const adminUser: User = {
  id: 1,
  email: 'renan@avalanche.gg',
  name: 'Renan Proenca',
  role: 'admin',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const managerUser: User = {
  id: 2,
  email: 'manager@team.gg',
  name: 'Bla Bla',
  role: 'manager',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    })
    localStorage.clear()
  })

  it('has correct initial state', () => {
    const state = useAuthStore.getState()

    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isAdmin).toBe(false)
  })

  describe('login', () => {
    it('sets user, token, isAuthenticated and isAdmin', () => {
      useAuthStore.getState().login(adminUser, 'jwt-token-123')
      const state = useAuthStore.getState()

      expect(state.user).toEqual(adminUser)
      expect(state.token).toBe('jwt-token-123')
      expect(state.isAuthenticated).toBe(true)
      expect(state.isAdmin).toBe(true)
    })

    it('sets isAdmin to true for admin user', () => {
      useAuthStore.getState().login(adminUser, 'token')
      expect(useAuthStore.getState().isAdmin).toBe(true)
    })

    it('sets isAdmin to false for manager user', () => {
      useAuthStore.getState().login(managerUser, 'token')
      expect(useAuthStore.getState().isAdmin).toBe(false)
    })
  })

  describe('logout', () => {
    it('clears all state', () => {
      useAuthStore.getState().login(adminUser, 'jwt-token-123')
      useAuthStore.getState().logout()
      const state = useAuthStore.getState()

      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isAdmin).toBe(false)
    })
  })

  describe('setUser', () => {
    it('updates user and isAdmin without changing token', () => {
      useAuthStore.getState().login(managerUser, 'jwt-token-123')
      useAuthStore.getState().setUser(adminUser)
      const state = useAuthStore.getState()

      expect(state.user).toEqual(adminUser)
      expect(state.token).toBe('jwt-token-123')
      expect(state.isAuthenticated).toBe(true)
      expect(state.isAdmin).toBe(true)
    })
  })

  describe('persistence', () => {
    it('restores user and token from localStorage', () => {
      const persistedState = {
        state: { user: adminUser, token: 'persisted-token' },
        version: 0,
      }
      localStorage.setItem('auth-storage', JSON.stringify(persistedState))

      useAuthStore.persist.rehydrate()
      const state = useAuthStore.getState()

      expect(state.user).toEqual(adminUser)
      expect(state.token).toBe('persisted-token')
      expect(state.isAuthenticated).toBe(true)
      expect(state.isAdmin).toBe(true)
    })
  })
})
