import { render, screen } from '@testing-library/react'
import React from 'react'
import AdminBookingsPage from './page'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-auth session as authenticated
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'u1', email: 'admin@example.com' } }, status: 'authenticated' }),
}))

// Mock supabase client to prevent initialization errors and mock channel/subscription APIs
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
    channel: () => ({
      on: () => ({
        subscribe: () => ({}),
      }),
    }),
    removeChannel: () => {},
  },
}))

// Mock router
vi.mock('next/navigation', async () => {
  const actual: any = await vi.importActual('next/navigation')
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
  }
})

describe('AdminBookingsPage', () => {
  beforeEach(() => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      console.log('🔮 Stubbed fetch called with URL:', url)
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { id: 'u1', email: 'admin@example.com', role: 'ADMIN' }
          })
        })
      }
      if (url.startsWith('/api/bookings')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [
              {
                id: 'b1',
                bookingNumber: 'B-0001',
                status: 'PAID',
                totalAmount: 40.00,
                bookingFee: 0,
                accessibilityRequirements: '',
                specialRequests: '',
                createdAt: new Date().toISOString(),
                customers: {
                  id: 'c1',
                  firstName: 'John',
                  lastName: 'Doe',
                  email: 'john@example.com',
                  phone: '123'
                },
                performances: {
                  id: 'p1',
                  dateTime: new Date().toISOString(),
                  isMatinee: false,
                  shows: {
                    id: 's1',
                    title: 'Hamlet'
                  }
                },
                booking_items: [
                  {
                    id: 'bi1',
                    seatId: 'seat1',
                    ticketType: 'Adult',
                    price: 20.00,
                    seats: {
                      id: 'seat1',
                      row: 'A',
                      number: 1,
                      section: 'Stalls'
                    }
                  },
                  {
                    id: 'bi2',
                    seatId: 'seat2',
                    ticketType: 'Adult',
                    price: 20.00,
                    seats: {
                      id: 'seat2',
                      row: 'A',
                      number: 2,
                      section: 'Stalls'
                    }
                  }
                ]
              }
            ]
          })
        })
      }
      if (url === '/api/shows') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: [
              { id: 's1', title: 'Hamlet' }
            ]
          })
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] })
      })
    })
    vi.stubGlobal('fetch', mockFetch)
  })

  it('fetches bookings and renders table with transformed data', async () => {
    render(React.createElement(AdminBookingsPage))

    // Table content
    expect(await screen.findByText('Bookings Management')).toBeInTheDocument()
    expect(await screen.findByText('B-0001')).toBeInTheDocument()
    expect((await screen.findAllByText('Hamlet')).length).toBeGreaterThan(0)

    // Seats string from booking_items
    expect(await screen.findByText(/A1, A2/)).toBeInTheDocument()

    // Amount formatting
    expect(await screen.findByText('£40.00')).toBeInTheDocument()
  })
})


