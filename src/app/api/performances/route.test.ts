import { describe, it, expect, vi } from 'vitest'
import { GET } from './route'
import type { NextRequest } from 'next/server'

const makeQuery = (data: any) => ({
  eq() { return this },
  gte() { return this },
  order() { return this },
  data,
  error: null,
})

vi.mock('@/lib/supabase', () => {
  const mockClient = {
    from: () => ({
      select: () => makeQuery([
        {
          id: 'perf-1',
          showId: 'show-1',
          dateTime: new Date().toISOString(),
          isMatinee: false,
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          shows: { id: 'show-1', title: 'Hamlet', status: 'PUBLISHED' },
        },
      ]),
    }),
  }
  return {
    supabase: mockClient,
    supabaseService: mockClient,
  }
})

const makeRequest = (url: string) => new Request(url)

describe('GET /api/performances', () => {
  it('returns performances joined with show', async () => {
    const res = await GET(makeRequest('http://localhost/api/performances?showId=show-1&upcoming=true') as unknown as NextRequest)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data[0].shows.title).toBe('Hamlet')
  })
})


