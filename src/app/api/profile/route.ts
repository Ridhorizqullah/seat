import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Email parameter is required',
        error: 'Email parameter is required'
      }, { status: 400 })
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          status: 'error',
          message: 'Profile not found',
          error: 'Profile not found'
        }, { status: 404 })
      }
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      status: 'success',
      data: customer
    })

  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      message: error.message || 'Failed to fetch profile',
      error: error.message || 'Failed to fetch profile'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, phone, address } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Email is required to update profile',
        error: 'Email is required to update profile'
      }, { status: 400 })
    }

    // Build update payload
    const updateData: any = { updatedAt: new Date().toISOString() }
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address

    const { data: customer, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('email', email)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          status: 'error',
          message: 'Profile not found',
          error: 'Profile not found'
        }, { status: 404 })
      }
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      status: 'success',
      data: customer
    })

  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json({
      success: false,
      status: 'error',
      message: error.message || 'Failed to update profile',
      error: error.message || 'Failed to update profile'
    }, { status: 500 })
  }
}
