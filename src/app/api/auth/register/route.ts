import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase'
import { randomUUID } from 'crypto'
import * as bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    // 1. Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 2. Insert into users table using service role to bypass RLS
    const { data: newUser, error: userError } = await supabaseService
      .from('users')
      .insert({
        id: randomUUID(),
        email,
        name: `${firstName} ${lastName}`,
        hashedPassword,
        role: 'CUSTOMER',
        organizationId: '6694386f-86bf-4854-b930-aa42ee66f7c7', // Primary organization
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select('email, role')
      .single()

    if (userError) {
      throw new Error(userError.message)
    }

    // 3. Optional: Create/Update customer record for booking info
    await supabaseService.from('customers').upsert({
      id: randomUUID(), // Ensure an ID if creating new
      email,
      firstName,
      lastName,
      updatedAt: new Date().toISOString()
    }, { onConflict: 'email' })

    const response = NextResponse.json({ success: true, role: 'CUSTOMER', email: newUser.email })
    
    // Set cookies
    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    }
    response.cookies.set('user_email', newUser.email, cookieOptions)
    response.cookies.set('user_role', 'CUSTOMER', cookieOptions)

    return response

  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
