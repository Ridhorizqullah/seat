import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const showId = searchParams.get('showId')

    if (!showId) {
      return NextResponse.json({
        success: false,
        error: 'Missing showId parameter'
      }, { status: 400 })
    }

    const { data: seats, error } = await supabase
      .from('seats')
      .select('*')
      .eq('show_id', showId)
      .order('seat_number', { ascending: true })

    if (error) {
      console.error('Error fetching seats:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      data: seats || []
    })

  } catch (error: any) {
    console.error('Error fetching seats:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch seats'
    }, { status: 500 })
  }
}
