'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Booking, Seat } from '@/types'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
// getUser removed - using server-side auth instead



export default function AdminBookingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [shows, setShows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success && (data.data.role === 'ADMIN' || data.data.role === 'STAFF')) {
          setUser(data.data)
          loadBookings()
          loadShows()
        } else {
          router.push('/admin/login')
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        router.push('/admin/login')
      }
    }
    checkAuth()
  }, [router])

  // --- SEAT MANAGEMENT & REALTIME (Integrasi Realtime Workflow) ---
  useEffect(() => {
    if (!selectedShowId) return

    const loadSeats = async () => {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .eq('show_id', selectedShowId)
        .order('seat_number', { ascending: true })

      if (!error && data) {
        setSeats(data)
      }
    }

    loadSeats()

    const channel = supabase
      .channel(`seats-${selectedShowId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'seats', filter: `show_id=eq.${selectedShowId}` }, 
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setSeats(prev => prev.map(s => s.id === payload.new.id ? { ...s, ...payload.new } : s))
          } else {
            loadSeats()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedShowId])
  // -----------------------------------------------------------------

  const loadBookings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/bookings?page=1&limit=20`)
      const data = await response.json()

      if (data.success) {
        // Transform the data to match the expected format
        const transformedBookings = data.data.map((booking: Record<string, any>) => ({
          id: booking.id,
          bookingNumber: booking.bookingNumber,
          status: booking.status,
          totalAmount: booking.totalAmount,
          bookingFee: booking.bookingFee,
          accessibilityRequirements: booking.accessibilityRequirements,
          specialRequests: booking.specialRequests,
          createdAt: booking.createdAt,
          customer: booking.customers ? {
            id: booking.customers.id,
            firstName: booking.customers.firstName,
            lastName: booking.customers.lastName,
            email: booking.customers.email,
            phone: booking.customers.phone
          } : null,
          show: booking.performances?.shows ? {
            id: booking.performances.shows.id,
            title: booking.performances.shows.title
          } : null,
          performance: booking.performances ? {
            id: booking.performances.id,
            dateTime: booking.performances.dateTime,
            isMatinee: booking.performances.isMatinee
          } : null,
          bookingItems: booking.booking_items ? booking.booking_items.map((item: any) => ({
            id: item.id,
            seatId: item.seatId,
            ticketType: item.ticketType,
            price: item.price,
            seat: item.seats ? {
              id: item.seats.id,
              row: item.seats.row,
              number: item.seats.number,
              section: item.seats.section
            } : null
          })) : []
        }))

        setBookings(transformedBookings)
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadShows = async () => {
    try {
      const response = await fetch('/api/shows')
      const data = await response.json()
      if (data.success) {
        setShows(data.data || [])
      }
    } catch (error) {
      console.error('Error loading shows:', error)
    }
  }



  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'CHECKED_IN': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-sm text-gray-600">{user?.email}</span>
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/admin" className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-gray-700 hover:text-gray-800">
              Dashboard
            </Link>
            <Link href="/admin/shows" className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-gray-700 hover:text-gray-800">
              Shows
            </Link>
            <Link href="/admin/bookings" className="py-3 px-1 border-b-2 border-blue-500 text-sm font-medium text-blue-600">
              Bookings
            </Link>
            <Link href="/admin/customers" className="py-3 px-1 border-b-2 border-transparent text-sm font-medium text-gray-700 hover:text-gray-800">
              Customers
            </Link>
          </div>
        </div>
      </nav>

      {/* Seat Occupancy Map */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Seat Occupancy Map</h2>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              onChange={(e) => setSelectedShowId(e.target.value)}
              value={selectedShowId || ''}
            >
              <option value="">Select a show to view seats</option>
              {shows.map(show => (
                <option key={show.id} value={show.id}>{show.title}</option>
              ))}
            </select>
          </div>

          {selectedShowId ? (
            <div className="flex flex-wrap gap-2 justify-center">
              {seats.length > 0 ? (
                seats.map(seat => (
                  <div 
                    key={seat.id}
                    className={`w-8 h-8 rounded-t-lg border-2 flex items-center justify-center text-[10px] font-bold ${
                      seat.status === 'booked' 
                        ? 'bg-red-500 border-red-600 text-white' 
                        : 'bg-green-100 border-green-300 text-green-800'
                    }`}
                    title={`Seat ${seat.seat_number} - ${seat.status}`}
                  >
                    {seat.seat_number}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No seats generated for this show.</p>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8 italic">Select a show above to visualize seat occupancy.</p>
          )}

          {selectedShowId && seats.length > 0 && (
            <div className="mt-6 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Available ({seats.filter(s => s.status !== 'booked').length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 border border-red-600 rounded"></div>
                <span>Booked ({seats.filter(s => s.status === 'booked').length})</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Show</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Seats</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.bookingNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.customer?.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.show?.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.bookingItems?.map(item => `${item.seat?.row}${item.seat?.number}`).join(', ') || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{booking.totalAmount?.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
