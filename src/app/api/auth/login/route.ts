import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import * as bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 6. VALIDATION
    if (!email) {
      return NextResponse.json({ status: 'error', message: 'Email is required' }, { status: 400 })
    }

    console.log(`[LOGIN DEBUG] Attempting login for: ${email}`)

    // 1. STEP 1: Cek ke tabel users (ADMIN / STAFF)
    const { data: user } = await supabase
      .from('users')
      .select('id, email, role, hashedPassword')
      .eq('email', email)
      .single()

    if (user) {
      console.log(`[LOGIN DEBUG] User found in 'users' table. Role: ${user.role}`)
      
      if (!password) {
        return NextResponse.json({ status: 'error', message: 'Password is required for Admin/Staff' }, { status: 400 })
      }

      // Verifikasi password menggunakan bcrypt.compare
      const isPasswordMatch = await bcrypt.compare(password, user.hashedPassword)
      console.log(`[LOGIN DEBUG] Password match: ${isPasswordMatch}`)

      if (isPasswordMatch) {
        // SUCCESS: ADMIN / STAFF
        return createLoginResponse(user.email, user.role)
      } else {
        // Jika password salah
        return NextResponse.json({ status: 'error', message: 'Invalid password' }, { status: 401 })
      }
    }

    // 2. STEP 2: Jika tidak ditemukan di users, cek ke tabel customers
    console.log(`[LOGIN DEBUG] User not found in 'users', checking 'customers' table...`)
    const { data: customer } = await supabase
      .from('customers')
      .select('id, email')
      .eq('email', email)
      .single()

    if (customer) {
      console.log(`[LOGIN DEBUG] Customer found. Logging in as CUSTOMER.`)
      // SUCCESS: CUSTOMER
      return createLoginResponse(customer.email, 'CUSTOMER')
    }

    // 3. STEP 3: Jika tidak ditemukan di kedua tabel
    console.log(`[LOGIN DEBUG] User not found in any table.`)
    return NextResponse.json({ status: 'error', message: 'User not found' }, { status: 404 })

  } catch (error: any) {
    console.error('[LOGIN ERROR]:', error)
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 })
  }
}

function createLoginResponse(email: string, role: string) {
  const response = NextResponse.json({ 
    status: 'success', 
    role: role 
  })

  // 3. SET COOKIE SECURELY
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure in production only
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }

  response.cookies.set('user_email', email, cookieOptions)
  response.cookies.set('user_role', role, cookieOptions)

  return response
}

