import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.delete('user_email')
  response.cookies.delete('user_role')
  return response
}
