import { http, HttpResponse } from 'msw'

const API_BASE = '/api'

export const handlers = [
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { user?: { email?: string; password?: string } }

    if (body.user?.email === 'admin@avalanche.gg' && body.user?.password === 'password') {
      return HttpResponse.json({
        data: {
          id: 1,
          email: 'admin@avalanche.gg',
          name: 'Admin',
          role: 'admin',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        meta: { token: 'fake-jwt-token' },
      })
    }

    return HttpResponse.json(
      {
        error: {
          status: 401,
          status_text: 'Unauthorized',
          code: 'invalid_credentials',
          message: 'Invalid email or password',
        },
      },
      { status: 401 },
    )
  }),

  http.post(`${API_BASE}/auth/register`, () => {
    return HttpResponse.json(
      {
        data: {
          id: 2,
          email: 'manager@team.com',
          name: 'Lero Lero',
          role: 'manager',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        meta: { token: 'fake-register-token' },
      },
      { status: 201 },
    )
  }),

  http.delete(`${API_BASE}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
