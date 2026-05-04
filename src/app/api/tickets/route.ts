import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSession } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Security: Customers can only see their own tickets
    if (session.role === 'CUSTOMER' && email && email !== session.email) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const targetEmail = email || session.email

    // 1. Find customer by email
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', targetEmail)
      .single()

    if (customerError || !customer) {
      // If customer not found, they just have no tickets
      return NextResponse.json({
        success: true,
        status: 'success',
        data: []
      })
    }

    // 2. Fetch bookings and ticket details
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        bookingNumber,
        status,
        totalAmount,
        createdAt,
        performances (
          id,
          dateTime,
          shows (
            id,
            title,
            imageUrl,
            venue:venues (
              name,
              address
            )
          )
        ),
        booking_items (
          id,
          ticketType,
          price,
          seats (
            row,
            number,
            section
          )
        )
      `)
      .eq('customerId', customer.id)
      .order('createdAt', { ascending: false })

    if (bookingsError) {
      throw new Error(`Database error: ${bookingsError.message}`)
    }

    // Return the bookings as tickets
    return NextResponse.json({
      success: true,
      status: 'success',
      data: bookings || []
    })

  } catch (error: any) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      message: error.message || 'Failed to fetch tickets',
      error: error.message || 'Failed to fetch tickets'
    }, { status: 500 })
  }
}
