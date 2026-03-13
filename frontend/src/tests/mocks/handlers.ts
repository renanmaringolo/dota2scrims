import { http, HttpResponse } from 'msw'

const API_BASE = '/api'

export const handlers = [
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }

    if (body.email === 'admin@avalanche.gg' && body.password === 'password') {
      return HttpResponse.json({
        data: {
          id: 1,
          email: 'admin@avalanche.gg',
          name: 'Admin',
          role: 'admin',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
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
      },
      { status: 201 },
    )
  }),

  http.delete(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({ data: { message: 'Logged out' } })
  }),
]
