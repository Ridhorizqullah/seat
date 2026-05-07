import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { getServerSession } from '@/lib/auth-server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

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
    const { data: customer, error: customerError } = await supabaseService
      .from('customers')
      .select('id')
      .ilike('email', targetEmail)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ success: true, status: 'success', data: [] })
    }

    // 2. Fetch bookings
    const { data: bookings, error: bookingsError } = await supabaseService
      .from('bookings')
      .select(`
        id,
        bookingNumber,
        status,
        totalAmount,
        createdAt,
        stripePaymentIntentId,
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

    if (bookingsError) throw bookingsError

    const results = bookings || []

    // 3. Self-Healing: Check Stripe for any PENDING bookings
    const pendingBookings = results.filter(b => b.status === 'PENDING')
    
    if (pendingBookings.length > 0 && process.env.STRIPE_SECRET_KEY) {
      for (const booking of pendingBookings) {
        try {
          let isActuallyPaid = false
          let piId = booking.stripePaymentIntentId

          if (piId) {
            const pi = await stripe.paymentIntents.retrieve(piId)
            if (pi.status === 'succeeded') isActuallyPaid = true
          } else {
            const sessions = await stripe.checkout.sessions.list({ limit: 15 })
            const match = sessions.data.find(s => s.metadata?.bookingId === booking.id)
            if (match && (match.payment_status === 'paid' || match.status === 'complete')) {
              isActuallyPaid = true
              piId = typeof match.payment_intent === 'string' ? match.payment_intent : (piId || '')
            }
          }

          if (isActuallyPaid) {
            await supabaseService.from('bookings').update({ 
              status: 'PAID', 
              stripePaymentIntentId: piId,
              paidAt: new Date().toISOString() 
            }).eq('id', booking.id)
            booking.status = 'PAID'
            booking.stripePaymentIntentId = piId
          }
        } catch (err) {
          console.error(`Self-healing failed for booking ${booking.id}:`, err)
        }
      }
    }

    // Filter results to only return PAID or CONFIRMED bookings for the customer's digital wallet/tickets view.
    // This prevents unpaid PENDING checkouts or abandoned sessions from appearing as active tickets.
    const activeTickets = results.filter(booking => booking.status !== 'PENDING')

    return NextResponse.json({
      success: true,
      status: 'success',
      data: activeTickets
    })

  } catch (error: any) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      message: error.message || 'Failed to fetch tickets'
    }, { status: 500 })
  }
}
