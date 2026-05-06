import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { randomUUID } from 'crypto'

interface UpdateShowRequest {
  title?: string
  description?: string
  imageUrl?: string
  genre?: string
  duration?: number
  ageRating?: string
  adultPrice?: number
  childPrice?: number
  concessionPrice?: number
  status?: string
  capacity?: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: show, error } = await supabaseService
      .from('shows')
      .select(`
        id,
        title,
        slug,
        description,
        imageUrl,
        genre,
        duration,
        ageRating,
        adultPrice,
        childPrice,
        concessionPrice,
        status,
        createdAt,
        updatedAt,
        performances (
          id,
          dateTime,
          isMatinee,
          notes,
          createdAt,
          updatedAt
        ),
        venue:venues (
          id,
          name,
          address,
          city
        ),
        seating_layout:seating_layouts (
          id,
          name,
          rows,
          columns
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching show:', error)

      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          status: 'error',
          message: 'Show not found',
          error: 'Show not found'
        }, { status: 404 })
      }

      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      status: 'success',
      data: show
    })

  } catch (error: any) {
    console.error('Error fetching show:', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      message: error.message || 'Failed to fetch show',
      error: error.message || 'Failed to fetch show'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateShowRequest = await request.json()

    // Build update object (only include provided fields)
    const updateData: any = {}

    if (body.title !== undefined) {
      updateData.title = body.title
      // Update slug when title changes
      updateData.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    if (body.description !== undefined) updateData.description = body.description
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
    if (body.genre !== undefined) updateData.genre = body.genre
    if (body.duration !== undefined) updateData.duration = body.duration
    if (body.ageRating !== undefined) updateData.ageRating = body.ageRating
    if (body.adultPrice !== undefined) updateData.adultPrice = body.adultPrice
    if (body.childPrice !== undefined) updateData.childPrice = body.childPrice
    if (body.concessionPrice !== undefined) updateData.concessionPrice = body.concessionPrice
    if (body.status !== undefined) updateData.status = body.status

    // Add updated timestamp
    const now = new Date().toISOString()
    updateData.updatedAt = now

    // If capacity is modified, handle seat regeneration
    if (body.capacity !== undefined) {
      // 1. Check if there are active bookings for this show
      const { data: bookings, error: bookingsError } = await supabaseService
        .from('bookings')
        .select('id')
        .eq('showId', id)
        .limit(1)

      if (bookingsError) {
        console.error('Error checking bookings for seat resizing:', bookingsError)
        throw new Error(`Database error: ${bookingsError.message}`)
      }

      if (bookings && bookings.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'Cannot change seat capacity because this show already has active bookings'
        }, { status: 400 })
      }

      // 2. Fetch the current show to find its seatingLayoutId
      const { data: currentShow, error: showFetchError } = await supabaseService
        .from('shows')
        .select('seatingLayoutId')
        .eq('id', id)
        .single()

      if (showFetchError) {
        console.error('Error fetching show for seat resizing:', showFetchError)
        throw new Error(`Database error: ${showFetchError.message}`)
      }

      // 3. Delete existing seats
      const { error: deleteSeatsError } = await supabaseService
        .from('seats')
        .delete()
        .eq('show_id', id)

      if (deleteSeatsError) {
        console.error('Error deleting old seats for resizing:', deleteSeatsError)
        throw new Error(`Database error: ${deleteSeatsError.message}`)
      }

      // 4. Generate and insert new seats
      const capacity = body.capacity
      const seatsToInsert = []
      const seatsPerRow = 10
      const rowsCount = Math.ceil(capacity / seatsPerRow)

      for (let r = 0; r < rowsCount; r++) {
        const rowLetter = String.fromCharCode(65 + r) // A, B, C...
        const seatsInThisRow = Math.min(seatsPerRow, capacity - (r * seatsPerRow))
        for (let i = 1; i <= seatsInThisRow; i++) {
          seatsToInsert.push({
            id: randomUUID(),
            show_id: id,
            seatingLayoutId: currentShow?.seatingLayoutId || '0baaef18-b917-41a1-89c8-a925460f372e',
            row: rowLetter,
            number: i,
            seat_number: `${rowLetter}${i}`,
            status: 'available',
            category: 'Reguler',
            isAccessible: false,
            isWheelchairSpace: false,
            createdAt: now,
            updatedAt: now
          })
        }
      }

      const { error: seatError } = await supabaseService
        .from('seats')
        .insert(seatsToInsert)

      if (seatError) {
        console.error("Gagal regenerate kursi:", seatError)
        throw new Error(`Failed to generate seats: ${seatError.message}`)
      }
    }

    // Update the show
    const { data: show, error } = await supabaseService
      .from('shows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating show:', error)

      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Show not found'
        }, { status: 404 })
      }

      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      data: show
    })

  } catch (error: any) {
    console.error('Error updating show:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update show'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if show has any bookings
    const { data: bookings, error: bookingsError } = await supabaseService
      .from('bookings')
      .select('id')
      .eq('showId', id)
      .limit(1)

    if (bookingsError) {
      console.error('Error checking bookings:', bookingsError)
      throw new Error(`Database error: ${bookingsError.message}`)
    }

    if (bookings && bookings.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete show with existing bookings'
      }, { status: 400 })
    }

    // Delete the show (performances will be cascade deleted)
    const { error } = await supabaseService
      .from('shows')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting show:', error)

      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Show not found'
        }, { status: 404 })
      }

      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Show deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting show:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete show'
    }, { status: 500 })
  }
}
