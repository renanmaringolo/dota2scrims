import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/tests/mocks/server'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'

describe('api client', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    })
  })

  it('does not send Authorization header when no token', async () => {
    let capturedHeaders: Headers | undefined

    server.use(
      http.get('*/test', ({ request }) => {
        capturedHeaders = request.headers
        return HttpResponse.json({ data: 'ok' })
      }),
    )

    await api.get('/test')

    expect(capturedHeaders?.get('authorization')).toBeNull()
  })

  it('sends Authorization: Bearer <token> when token exists', async () => {
    let capturedHeaders: Headers | undefined

    useAuthStore.setState({ token: 'jwt-test-token' })

    server.use(
      http.get('*/test', ({ request }) => {
        capturedHeaders = request.headers
        return HttpResponse.json({ data: 'ok' })
      }),
    )

    await api.get('/test')

    expect(capturedHeaders?.get('authorization')).toBe('Bearer jwt-test-token')
  })

  it('calls logout and redirects to /login on 401 response', async () => {
    useAuthStore.setState({
      token: 'expired-token',
      isAuthenticated: true,
    })

    server.use(
      http.get('*/test', () => {
        return HttpResponse.json(
          { error: { message: 'Unauthorized' } },
          { status: 401 },
        )
      }),
    )

    const originalLocation = window.location
    const assignMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, assign: assignMock },
      writable: true,
      configurable: true,
    })

    try {
      await expect(api.get('/test')).rejects.toThrow()

      expect(useAuthStore.getState().token).toBeNull()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(assignMock).toHaveBeenCalledWith('/login')
    } finally {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    }
  })

  it('does NOT logout on 401 from /auth/login', async () => {
    useAuthStore.setState({
      token: 'some-token',
      isAuthenticated: true,
    })

    server.use(
      http.post('*/auth/login', () => {
        return HttpResponse.json(
          { error: { message: 'Invalid credentials' } },
          { status: 401 },
        )
      }),
    )

    await expect(api.post('/auth/login', {})).rejects.toThrow()

    expect(useAuthStore.getState().token).toBe('some-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('returns data normally on 200 response', async () => {
    server.use(
      http.get('*/test', () => {
        return HttpResponse.json({ data: { id: 1, name: 'Lero Lero' } })
      }),
    )

    const response = await api.get('/test')

    expect(response.data).toEqual({ data: { id: 1, name: 'Lero Lero' } })
  })

  it('rejects with error on 422 response', async () => {
    server.use(
      http.post('*/test', () => {
        return HttpResponse.json(
          {
            error: {
              status: 422,
              status_text: 'Unprocessable Entity',
              code: 'validation_error',
              message: 'Email is invalid',
            },
          },
          { status: 422 },
        )
      }),
    )

    await expect(api.post('/test', {})).rejects.toMatchObject({
      response: {
        status: 422,
        data: {
          error: {
            code: 'validation_error',
            message: 'Email is invalid',
          },
        },
      },
    })
  })

  it('uses VITE_API_URL as baseURL when available', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api')
    vi.resetModules()

    const { default: freshApi } = await import('@/lib/api')

    expect(freshApi.defaults.baseURL).toBe('http://localhost:3000/api')

    vi.unstubAllEnvs()
  })

  it('uses /api as default baseURL when VITE_API_URL is not set', async () => {
    vi.stubEnv('VITE_API_URL', '')
    vi.resetModules()

    const { default: freshApi } = await import('@/lib/api')

    expect(freshApi.defaults.baseURL).toBe('/api')

    vi.unstubAllEnvs()
  })
})
