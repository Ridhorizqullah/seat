import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'



import { logger } from '@/lib/logger'

// Basic in-memory rate limiting (Note: limited in serverless/multi-instance environments)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(ip) || { count: 0, lastReset: now }

  if (now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
    userLimit.count = 1
    userLimit.lastReset = now
  } else {
    userLimit.count++
  }

  rateLimitMap.set(ip, userLimit)
  return userLimit.count <= MAX_REQUESTS_PER_WINDOW
}

import { z } from 'zod'
import { getServerSession } from '@/lib/auth-server'

// Schema for request validation
const BookingSchema = z.object({
  performanceId: z.string().uuid(),
  customer: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  seats: z.array(z.object({
    seatId: z.string().uuid(),
    ticketType: z.enum(['ADULT', 'CHILD', 'CONCESSION']),
    price: z.number().positive(),
  })).min(1),
  totalAmount: z.number().positive(),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  
  if (!checkRateLimit(ip)) {
    logger.warn('Rate limit exceeded', { ip })
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Too many requests. Please try again later.'
    }, { status: 429 })
  }

  try {
    // 1. Validate Authentication (Server-side check)
    const session = await getServerSession()
    // Note: We allow booking even if not logged in (creates/finds customer), 
    // but we log if it's an authenticated user.
    
    // 2. Validate Request Body
    const json = await request.json()
    const validation = BookingSchema.safeParse(json)
    
    if (!validation.success) {
      logger.warn('Invalid booking request body', { errors: validation.error.format() })
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Invalid request data',
        errors: validation.error.format()
      }, { status: 400 })
    }

    const { performanceId, customer, seats, totalAmount } = validation.data
    
    logger.info('Processing booking request', { 
      performanceId, 
      email: customer.email,
      seatsCount: seats.length,
      userId: session?.id 
    })

    // 3. CRITICAL SECTION: Double Booking Prevention
    // Fresh check for availability
    const seatIds = seats.map(seat => seat.seatId)
    
    const { data: conflictCheck, error: conflictError } = await supabase
      .from('booking_items')
      .select('seatId, bookings!inner(status)')
      .eq('bookings.performanceId', performanceId)
      .in('bookings.status', ['PENDING', 'CONFIRMED', 'PAID', 'CHECKED_IN'])
      .in('seatId', seatIds)

    if (conflictError) throw conflictError

    if (conflictCheck && conflictCheck.length > 0) {
      const alreadyBooked = conflictCheck.map(c => c.seatId)
      logger.warn('Double booking attempt detected', { performanceId, alreadyBooked })
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Some seats were just taken. Please refresh and try again.',
        data: { alreadyBookedSeats: alreadyBooked }
      }, { status: 409 })
    }

    // 4. Get performance and show details
    const { data: performance, error: perfError } = await supabase
      .from('performances')
      .select('id, showId')
      .eq('id', performanceId)
      .single()

    if (perfError || !performance) {
      return NextResponse.json({ 
        success: false, 
        status: 'error', 
        message: 'Pertunjukan tidak ditemukan' 
      }, { status: 404 })
    }

    // 5. Customer Handling (Atomic find-or-create)
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customer.email)
      .single()

    let customerId = existingCustomer?.id

    if (!customerId) {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          id: randomUUID(),
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || null,
          updatedAt: new Date().toISOString()
        })
        .select('id')
        .single()

      if (customerError) throw customerError
      customerId = newCustomer.id
    }

    // 6. Booking Creation (PENDING)
    const bookingId = randomUUID()
    const bookingNumber = `BK${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`
    
    const { error: bookingError } = await supabase
      .from('bookings')
      .insert({
        id: bookingId,
        bookingNumber,
        status: 'PENDING',
        totalAmount,
        performanceId,
        showId: performance.showId,
        customerId,
        updatedAt: new Date().toISOString()
      })

    if (bookingError) throw bookingError

    // 7. Booking Items Insertion
    const bookingItems = seats.map(seat => ({
      id: randomUUID(),
      seatId: seat.seatId,
      ticketType: seat.ticketType,
      price: seat.price,
      bookingId
    }))

    const { error: itemsError } = await supabase
      .from('booking_items')
      .insert(bookingItems)

    if (itemsError) {
      // Rollback
      await supabase.from('bookings').delete().eq('id', bookingId)
      throw itemsError
    }

    logger.info('Booking successfully initiated', { bookingId, bookingNumber })

    return NextResponse.json({
      success: true,
      status: 'success',
      message: 'Order initiated',
      data: { 
        bookingId, 
        bookingNumber,
        status: 'PENDING'
      }
    })

  } catch (error: any) {
    logger.error('CRITICAL: Failed to process booking', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'An internal error occurred. Please try again.'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    // Only allow customers to see their own bookings, or admins to see all
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const email = searchParams.get('email')

    if (!session) {
      return NextResponse.json({ success: false, status: 'error', message: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('bookings')
      .select(`
        *,
        customers(*),
        performances(*, shows(*, venues(*))),
        booking_items(*, seats(*))
      `)

    if (session.role === 'CUSTOMER') {
      // Security: Force filter by their own email or ID
      if (email && email !== session.email) {
         return NextResponse.json({ success: false, status: 'error', message: 'Forbidden' }, { status: 403 })
      }
      query = query.eq('customers.email', session.email)
    } else if (customerId) {
      query = query.eq('customerId', customerId)
    }

    const { data: bookings, error } = await query.order('createdAt', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      status: 'success',
      data: bookings
    })

  } catch (error: any) {
    logger.error('Failed to fetch bookings', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      message: 'Failed to fetch bookings'
    }, { status: 500 })
  }
}
