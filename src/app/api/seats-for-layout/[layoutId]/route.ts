import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ layoutId: string }> }
) {
  try {
    const { layoutId } = await params

    // Fetch seating layout
    const { data: layout, error: layoutError } = await supabase
      .from('seating_layouts')
      .select('*')
      .eq('id', layoutId)
      .single()

    if (layoutError || !layout) {
      return NextResponse.json({
        success: false,
        error: 'Seating layout not found'
      }, { status: 404 })
    }

    // Fetch seats for this layout
    // Strategy: if showId provided, try show_id first; fall back to seatingLayoutId
    const showId = request.nextUrl.searchParams.get('showId')

    let seats: any[] = []
    let seatsError: any = null

    if (showId) {
      const { data: showSeats, error: showSeatsError } = await supabase
        .from('seats')
        .select('*')
        .eq('show_id', showId)
        .order('row', { ascending: true })
        .order('number', { ascending: true })

      if (showSeatsError) {
        seatsError = showSeatsError
      } else if (showSeats && showSeats.length > 0) {
        seats = showSeats
      } else {
        // No show-scoped seats found — fall back to layout-scoped seats
        const { data: layoutSeats, error: layoutSeatsError } = await supabase
          .from('seats')
          .select('*')
          .eq('seatingLayoutId', layoutId)
          .order('row', { ascending: true })
          .order('number', { ascending: true })

        if (layoutSeatsError) {
          seatsError = layoutSeatsError
        } else {
          seats = layoutSeats || []
        }
      }
    } else {
      const { data: layoutSeats, error: layoutSeatsError } = await supabase
        .from('seats')
        .select('*')
        .eq('seatingLayoutId', layoutId)
        .order('row', { ascending: true })
        .order('number', { ascending: true })

      if (layoutSeatsError) {
        seatsError = layoutSeatsError
      } else {
        seats = layoutSeats || []
      }
    }

    if (seatsError) {
      console.error('Error fetching seats:', seatsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch seats'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        layout: layout,
        seats: seats
      }
    })

  } catch (error: any) {
    console.error('Error fetching seating layout:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch seating layout'
    }, { status: 500 })
  }
}
