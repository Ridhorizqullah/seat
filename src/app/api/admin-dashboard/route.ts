import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { auth } from '@/lib/auth' 

export async function GET() {
  try {
    // Check authentication
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Verify user is admin
    const { data: user, error: userError } = await supabaseService
      .from('users')
      .select('role, organizationId')
      .eq('email', session.user.email)
      .single()

    console.log('Admin Dashboard Request:', { 
      email: session.user.email, 
      organizationId: user?.organizationId,
      role: user?.role 
    })

    if (userError || !user || user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions'
      }, { status: 403 })
    }
    // Fetch all bookings with customer and performance details
    const { data: bookings, error: bookingsError } = await supabaseService
      .from('bookings')
      .select(`
        id,
        bookingNumber,
        status,
        totalAmount,
        bookingFee,
        createdAt,
        customer:customers (
          id,
          firstName,
          lastName,
          email,
          phone
        ),
        performance:performances (
          id,
          dateTime,
          isMatinee
        ),
        show:shows!inner (
          id,
          title,
          organizationId
        )
      `)
      .eq('shows.organizationId', user.organizationId)
      .order('createdAt', { ascending: false })

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      throw new Error(`Failed to fetch bookings: ${bookingsError.message}`)
    }

    // Fetch all shows with performances
    const { data: shows, error: showsError } = await supabaseService
      .from('shows')
      .select(`
        id,
        title,
        status,
        organizationId,
        performances (
          id,
          dateTime,
          isMatinee,
          notes
        )
      `)
      .eq('organizationId', user.organizationId)
      .order('createdAt', { ascending: false })

    if (showsError) {
      console.error('Error fetching shows:', showsError)
      throw new Error(`Failed to fetch shows: ${showsError.message}`)
    }

    // Calculate stats
    const totalBookings = bookings?.length || 0
    const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0) || 0
    const upcomingShows = shows?.filter(show => show.status === 'PUBLISHED').length || 0
    const checkedInToday = bookings?.filter(booking => booking.status === 'CHECKED_IN').length || 0

    // Get upcoming performances with booking data
    const allPerformances = shows?.flatMap(show =>
      show.performances?.map(perf => ({
        id: perf.id,
        dateTime: perf.dateTime,
        isMatinee: perf.isMatinee,
        notes: perf.notes,
        show: {
          id: show.id,
          title: show.title
        },
        // Add booking data for this performance
        bookings: bookings?.filter(booking =>
          booking.performance && (booking.performance as any).id === perf.id
        ).map(booking => ({
          id: booking.id,
          totalAmount: booking.totalAmount,
          status: booking.status,
          createdAt: booking.createdAt
        })) || []
      })) || []
    ) || []

    // Filter to only future performances and sort by date
    const upcomingPerformances = allPerformances
      .filter(perf => new Date(perf.dateTime) > new Date())
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .slice(0, 5)

    // Recent bookings (last 10)
    const recentBookings = bookings?.slice(0, 10).map(booking => ({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      totalAmount: booking.totalAmount,
      bookingFee: booking.bookingFee,
      status: booking.status,
      createdAt: booking.createdAt,
      customer: booking.customer ? {
        id: (booking.customer as any).id,
        firstName: (booking.customer as any).firstName,
        lastName: (booking.customer as any).lastName,
        email: (booking.customer as any).email,
        phone: (booking.customer as any).phone
      } : null,
      show: (booking.show as any) ? {
        id: (booking.show as any).id,
        title: (booking.show as any).title
      } : null,
      performance: booking.performance ? {
        id: (booking.performance as any).id,
        dateTime: (booking.performance as any).dateTime,
        isMatinee: (booking.performance as any).isMatinee
      } : null
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalBookings,
          totalRevenue,
          upcomingShows,
          checkedInToday
        },
        recentBookings,
        upcomingPerformances
      }
    })

  } catch (error: unknown) {
    console.error('Error fetching admin dashboard data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data'
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}
