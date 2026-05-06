import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import * as bcrypt from 'bcryptjs'

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
    const { email, firstName, lastName, phone, address, newPassword } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Email is required to update profile',
        error: 'Email is required to update profile'
      }, { status: 400 })
    }

    // 1. Handle password update if provided
    if (newPassword) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)
      
      // Update in users table (primary nextauth account table)
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          hashedPassword, 
          updatedAt: new Date().toISOString() 
        })
        .eq('email', email)

      if (userError) {
        console.error('Error updating password in users table:', userError)
        throw new Error(`Failed to update authentication credentials: ${userError.message}`)
      }

      // Sync into customers table (contains hashedPassword as well)
      await supabase
        .from('customers')
        .update({ 
          hashedPassword, 
          updatedAt: new Date().toISOString() 
        })
        .eq('email', email)
    }

    // 2. Build profile update payload
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

