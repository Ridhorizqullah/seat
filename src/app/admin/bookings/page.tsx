'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Booking } from '../../../types'
import { Button } from '../../../components/ui/button'
// getUser removed - using server-side auth instead



export default function AdminBookingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success && (data.data.role === 'ADMIN' || data.data.role === 'STAFF')) {
          setUser(data.data)
          loadBookings()
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

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Show</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.bookingNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.customer?.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.show?.title}</td>
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
