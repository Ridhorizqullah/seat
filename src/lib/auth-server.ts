import { cookies } from 'next/headers'
import { supabase } from './supabase'
import { logger } from './logger'

export interface UserSession {
  email: string
  role: string
  id: string
}

/**
 * Validates the current session against the database.
 * Does not trust the cookie value alone.
 */
export async function getServerSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies()
    const email = cookieStore.get('user_email')?.value

    if (!email) return null

    // Validate email and get role from DB
    // 1. Check in users table (Admin/Staff)
    const { data: user } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .single()

    if (user) {
      return {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }

    // 2. Check in customers table
    const { data: customer } = await supabase
      .from('customers')
      .select('id, email')
      .eq('email', email)
      .single()

    if (customer) {
      return {
        id: customer.id,
        email: customer.email,
        role: 'CUSTOMER'
      }
    }

    return null
  } catch (error) {
    logger.error('Error validating server session', error)
    return null
  }
}
