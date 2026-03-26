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

  http.get(`${API_BASE}/scrims`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          status: 'scheduled',
          time_slot: { id: 10, starts_at: '2026-03-27T20:00:00Z', ends_at: '2026-03-27T22:00:00Z', status: 'booked' },
          team: { id: 2, name: 'Rock n Sports', mmr: 4500 },
          lobby_name: 'avalanche-vs-rns',
          lobby_password: 'scrim123',
          server_host: 'brazil',
          created_at: '2026-03-26T10:00:00Z',
        },
      ],
      meta: { total: 1 },
    })
  }),

  http.post(`${API_BASE}/scrims`, async ({ request }) => {
    const body = (await request.json()) as { scrim: Record<string, unknown> }
    return HttpResponse.json(
      {
        data: {
          id: 2,
          status: 'scheduled',
          time_slot: { id: body.scrim.time_slot_id, starts_at: '2026-03-28T20:00:00Z', ends_at: '2026-03-28T22:00:00Z', status: 'booked' },
          team: { id: body.scrim.team_id, name: 'Lero Lero Team', mmr: 4000 },
          lobby_name: body.scrim.lobby_name,
          lobby_password: body.scrim.lobby_password,
          server_host: body.scrim.server_host,
          created_at: '2026-03-26T12:00:00Z',
        },
      },
      { status: 201 },
    )
  }),

  http.post(`${API_BASE}/scrims/:id/cancel`, async ({ request, params }) => {
    const body = (await request.json()) as { reason: string }
    return HttpResponse.json({
      data: {
        id: Number(params.id),
        status: 'cancelled',
        time_slot: { id: 10, starts_at: '2026-03-27T20:00:00Z', ends_at: '2026-03-27T22:00:00Z', status: 'available' },
        team: { id: 2, name: 'Rock n Sports', mmr: 4500 },
        lobby_name: 'avalanche-vs-rns',
        lobby_password: 'scrim123',
        server_host: 'brazil',
        cancellation_reason: body.reason,
        cancelled_at: '2026-03-26T15:00:00Z',
        created_at: '2026-03-26T10:00:00Z',
      },
    })
  }),
]
