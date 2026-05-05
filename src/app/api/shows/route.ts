import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseService } from '@/lib/supabase'
import { randomUUID } from 'crypto'
import { getServerSession } from '@/lib/auth-server'

interface CreateShowRequest {
  title: string
  description?: string
  imageUrl?: string
  genre?: string
  duration?: number
  ageRating?: string
  adultPrice: number
  childPrice: number
  concessionPrice: number
  status: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateShowRequest = await request.json()

    // Validate required fields
    if (!body.title || !body.adultPrice || !body.childPrice || !body.concessionPrice) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, adultPrice, childPrice, concessionPrice'
      }, { status: 400 })
    }

    // Generate slug from title
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const session = await getServerSession()
    if (!session || !session.organizationId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: No organization associated with this account'
      }, { status: 401 })
    }

    // Get the first available venue and seating layout for this organization
    const { data: venue } = await supabase
      .from('venues')
      .select('id')
      .eq('organizationId', session.organizationId)
      .limit(1)
      .single()

    const { data: layout } = await supabase
      .from('seating_layouts')
      .select('id')
      .eq('venueId', venue?.id || '')
      .limit(1)
      .single()

    // Create the show
    const showId = randomUUID()
    const now = new Date().toISOString()

    const { data: show, error } = await supabaseService
      .from('shows')
      .insert({
        id: showId,
        title: body.title,
        slug: slug,
        description: body.description || '',
        imageUrl: body.imageUrl || null,
        genre: body.genre || '',
        duration: body.duration || 120,
        ageRating: body.ageRating || 'PG',
        adultPrice: body.adultPrice,
        childPrice: body.childPrice,
        concessionPrice: body.concessionPrice,
        status: body.status || 'DRAFT',
        organizationId: session.organizationId,
        venueId: venue?.id || 'a550e840-e29b-41d4-a716-446655440000', // Fallback to demo if none found
        seatingLayoutId: layout?.id || '869f0aca-0611-4b8b-bf16-b9356854b35a', // Fallback to demo if none found
        createdAt: now,
        updatedAt: now
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating show:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    // --- AUTOMATIC SEAT GENERATION (Admin Shows Workflow) ---
    // Generate 5 rows (A-E) with 10 seats each (50 seats total)
    const rows = ['A', 'B', 'C', 'D', 'E']
    const seatsToInsert = []

    for (const row of rows) {
      for (let i = 1; i <= 10; i++) {
        seatsToInsert.push({
          show_id: showId,
          row: row,
          number: i,
          seat_number: `${row}${i}`,
          status: 'available',
          category: 'Reguler'
        })
      }
    }

    const { error: seatError } = await supabaseService
      .from('seats')
      .insert(seatsToInsert)

    if (seatError) {
      console.error("Gagal generate kursi:", seatError)
      // We don't necessarily want to fail the whole show creation if seats fail, 
      // but it's better to log it or handle it. 
      // For now, let's just log it as per the workflow example.
    }
    // ---------------------------------------------------------

    return NextResponse.json({
      success: true,
      data: show
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating show:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create show'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const search = searchParams.get('search')

    const session = await getServerSession()
    
    // Build query using service role to bypass RLS and see relevant data
    let query = supabaseService
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
        seats:seats!show_id(count)
      `)

    // If it's an admin/staff request, filter by their organization
    if (session?.organizationId) {
      query = query.eq('organizationId', session.organizationId)
    }

    // Apply filters - show is published if status is PUBLISHED
    if (published === 'true') {
      query = query.eq('status', 'PUBLISHED')
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,genre.ilike.%${search}%`)
    }

    // Order by
    query = query.order('createdAt', { ascending: false })

    const { data: shows, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      data: shows || [],
      meta: {
        total: shows?.length || 0,
        page: 1,
        limit: 100,
        totalPages: 1
      }
    })

  } catch (error: any) {
    console.error('Error fetching shows:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch shows'
    }, { status: 500 })
  }
}
