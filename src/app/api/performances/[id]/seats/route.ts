import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseService } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Get the performance to find its show and seating layout
    // Use service role to ensure we can see the linked show (bypassing RLS)
    const { data: performance, error: perfError } = await supabaseService
      .from('performances')
      .select(`
        id,
        showId,
        show:shows (
          id,
          seatingLayoutId
        )
      `)
      .eq('id', id)
      .single()

    if (perfError || !performance) {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Performance not found',
        error: 'Performance not found'
      }, { status: 404 })
    }

    const seatingLayoutId = (performance.show as any)?.seatingLayoutId

    if (!seatingLayoutId) {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'No seating layout assigned to this show',
        error: 'No seating layout assigned to this show'
      }, { status: 404 })
    }

    // 2. Get all seats for this show (New Logic with Seating Layout fallback)
    let seats: any[] = []
    const { data: showSeats, error: seatsError } = await supabaseService
      .from('seats')
      .select('*')
      .eq('show_id', performance.showId)
      .order('row', { ascending: true })
      .order('number', { ascending: true })

    if (seatsError) {
      throw new Error(`Database error: ${seatsError.message}`)
    }

    if (showSeats && showSeats.length > 0) {
      seats = showSeats
    } else {
      // Fall back to layout-scoped seats
      const { data: layoutSeats, error: layoutSeatsError } = await supabaseService
        .from('seats')
        .select('*')
        .eq('seatingLayoutId', seatingLayoutId)
        .order('row', { ascending: true })
        .order('number', { ascending: true })

      if (layoutSeatsError) {
        throw new Error(`Database error: ${layoutSeatsError.message}`)
      }
      seats = layoutSeats || []
    }

    // 3. Get booked seats for this performance
    const { data: bookedItems, error: bookedError } = await supabase
      .from('booking_items')
      .select(`
        seatId,
        bookings!inner (
          status,
          performanceId
        )
      `)
      .eq('bookings.performanceId', id)
      .in('bookings.status', ['PENDING', 'CONFIRMED', 'PAID', 'CHECKED_IN'])

    if (bookedError) {
      throw new Error(`Database error: ${bookedError.message}`)
    }

    const bookedSeatIds = new Set(bookedItems?.map(item => item.seatId) || [])

    // 4. Map seats to include booking status
    const seatsWithStatus = seats?.map(seat => ({
      ...seat,
      status: bookedSeatIds.has(seat.id) ? 'booked' : 'available'
    })) || []

    return NextResponse.json({
      success: true,
      status: 'success',
      data: seatsWithStatus
    })

  } catch (error: any) {
    console.error('Error fetching seats:', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      message: error.message || 'Failed to fetch seats',
      error: error.message || 'Failed to fetch seats'
    }, { status: 500 })
  }
}
