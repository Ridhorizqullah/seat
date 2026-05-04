import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Get the performance to find its show and seating layout
    const { data: performance, error: perfError } = await supabase
      .from('performances')
      .select(`
        id,
        showId,
        shows (
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

    const seatingLayoutId = (performance.shows as any).seatingLayoutId

    if (!seatingLayoutId) {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'No seating layout assigned to this show',
        error: 'No seating layout assigned to this show'
      }, { status: 404 })
    }

    // 2. Get all seats for this layout
    const { data: seats, error: seatsError } = await supabase
      .from('seats')
      .select('*')
      .eq('seatingLayoutId', seatingLayoutId)
      .order('row', { ascending: true })
      .order('number', { ascending: true })

    if (seatsError) {
      throw new Error(`Database error: ${seatsError.message}`)
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
      seatId: seat.id,
      row: seat.row,
      number: seat.number,
      status: bookedSeatIds.has(seat.id) ? 'booked' : 'available',
      // keep other seat info just in case
      section: seat.section,
      type: seat.type
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
