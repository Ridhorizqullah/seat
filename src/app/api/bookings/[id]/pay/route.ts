import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { getServerSession } from '@/lib/auth-server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // 1. Get current booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('status, customerId, customers(email)')
      .eq('id', id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 })
    }

    // 2. Validate Ownership
    if (session.role === 'CUSTOMER' && (booking.customers as any).email !== session.email) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json({ success: false, message: 'Booking is already processed' }, { status: 400 })
    }

    // 3. Simulate Payment Processing
    logger.info('Simulating payment for booking', { id })
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 4. Update Status: PENDING -> PAID -> CONFIRMED
    const { data: items } = await supabase
      .from('booking_items')
      .select('seatId')
      .eq('bookingId', id)

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'CONFIRMED', 
        updatedAt: new Date().toISOString() 
      })
      .eq('id', id)

    if (updateError) throw updateError

    // 5. Update Seat Status in the seats table (New logic)
    if (items && items.length > 0) {
      const seatIds = items.map(i => i.seatId)
      await supabase
        .from('seats')
        .update({ status: 'booked' })
        .in('id', seatIds)
    }

    logger.info('Booking confirmed and seats marked as booked', { id, seatIds: items?.map(i => i.seatId) })

    return NextResponse.json({
      success: true,
      status: 'success',
      message: 'Payment successful and booking confirmed',
      data: { status: 'CONFIRMED' }
    })

  } catch (error: any) {
    logger.error('Payment processing failed', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Payment failed'
    }, { status: 500 })
  }
}
