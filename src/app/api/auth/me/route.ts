import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'

export async function GET() {
  const session = await getServerSession()

  if (!session) {
    return NextResponse.json({ 
      success: false, 
      status: 'error', 
      message: 'Not authenticated' 
    }, { status: 401 })
  }

  return NextResponse.json({
    success: true,
    status: 'success',
    data: session
  })
}
