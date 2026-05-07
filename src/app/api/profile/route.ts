import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { getServerSession } from '@/lib/auth-server'
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

    // Secure the endpoint by verifying active session
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Unauthorized: No active session found',
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Only allow users to fetch their own profile, unless they are an ADMIN
    if (session.email !== email && session.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Forbidden: You do not have permission to view this profile',
        error: 'Forbidden'
      }, { status: 403 })
    }

    const { data: customer, error } = await supabaseService
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
    const { email, newEmail, firstName, lastName, phone, address, newPassword } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Email is required to update profile',
        error: 'Email is required to update profile'
      }, { status: 400 })
    }

    // Secure the endpoint by verifying active session
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Unauthorized: No active session found',
        error: 'Unauthorized'
      }, { status: 401 })
    }

    // Only allow users to update their own profile, unless they are an ADMIN
    if (session.email !== email && session.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: 'Forbidden: You do not have permission to update this profile',
        error: 'Forbidden'
      }, { status: 403 })
    }

    // 1. Handle password update if provided
    if (newPassword) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)
      
      const { error: userError } = await supabaseService
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

      await supabaseService
        .from('customers')
        .update({ 
          hashedPassword, 
          updatedAt: new Date().toISOString() 
        })
        .eq('email', email)
    }

    // 2. Handle email change if newEmail is provided and different
    const targetEmail = (newEmail && newEmail !== email) ? newEmail : email
    if (newEmail && newEmail !== email) {
      // Check email not already taken
      const { data: existingUser } = await supabaseService
        .from('users')
        .select('id')
        .eq('email', newEmail)
        .maybeSingle()
      if (existingUser) {
        return NextResponse.json({
          success: false,
          status: 'error',
          message: 'Email address is already in use by another account.',
          error: 'Email already in use'
        }, { status: 409 })
      }

      // Update email in users table
      const { error: userEmailError } = await supabaseService
        .from('users')
        .update({ email: newEmail, updatedAt: new Date().toISOString() })
        .eq('email', email)
      if (userEmailError) throw new Error(`Failed to update email in users: ${userEmailError.message}`)

      // Update email in customers table
      await supabaseService
        .from('customers')
        .update({ email: newEmail, updatedAt: new Date().toISOString() })
        .eq('email', email)
    }

    // 3. Build profile update payload
    const updateData: any = { updatedAt: new Date().toISOString() }
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address

    // 4. Check if customer record exists; if not, create it (upsert)
    const { data: existingCustomer } = await supabaseService
      .from('customers')
      .select('id')
      .eq('email', targetEmail)
      .maybeSingle()

    let customer: any
    if (!existingCustomer) {
      // Get user id to use as customer id for consistency
      const { data: userRow } = await supabaseService
        .from('users')
        .select('id')
        .eq('email', targetEmail)
        .maybeSingle()

      const { data: inserted, error: insertError } = await supabaseService
        .from('customers')
        .insert({
          id: userRow?.id || crypto.randomUUID(),
          email: targetEmail,
          firstName: firstName || '',
          lastName: lastName || '',
          phone: phone || null,
          address: address || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) throw new Error(`Failed to create customer profile: ${insertError.message}`)
      customer = inserted
    } else {
      const { data: updated, error: updateError } = await supabaseService
        .from('customers')
        .update(updateData)
        .eq('email', targetEmail)
        .select()
        .single()

      if (updateError) throw new Error(`Database error: ${updateError.message}`)
      customer = updated
    }

    const response = NextResponse.json({
      success: true,
      status: 'success',
      data: customer,
      emailChanged: newEmail && newEmail !== email ? true : false,
      newEmail: newEmail && newEmail !== email ? newEmail : undefined
    })

    // Update cookie if email changed
    if (newEmail && newEmail !== email) {
      const cookieOptions = {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7
      }
      response.cookies.set('user_email', newEmail, cookieOptions)
    }

    return response

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
