import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const role = request.cookies.get('user_role')?.value

  if (pathname.startsWith('/admin')) {
    if (!role) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const upperRole = role.toUpperCase()
    if (upperRole !== 'ADMIN' && upperRole !== 'STAFF') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}