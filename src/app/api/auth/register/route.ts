import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    // Cek apakah email sudah ada di customers atau users
    const { data: existingCustomer } = await supabase.from('customers').select('id').eq('email', email).single()
    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single()

    if (existingCustomer || existingUser) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 })
    }

    // Karena tidak boleh mengubah schema dan customer mungkin tidak ada password, kita asumsikan simpan info basic.
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        id: randomUUID(),
        email,
        firstName,
        lastName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select('email')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    const response = NextResponse.json({ success: true, role: 'CUSTOMER', email: newCustomer.email })
    response.cookies.set('user_email', newCustomer.email, { path: '/' })
    response.cookies.set('user_role', 'CUSTOMER', { path: '/' })

    return response

  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
