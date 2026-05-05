import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const role = request.cookies.get('user_role')?.value
  const email = request.cookies.get('user_email')?.value

  // Admin and Staff Protection
  if (pathname.startsWith('/admin')) {
    if (!role) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const upperRole = role.toUpperCase()
    if (upperRole !== 'ADMIN' && upperRole !== 'STAFF') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // User Protection (Booking & Tickets)
  const protectedUserPaths = ['/seat-selection', '/checkout', '/tickets']
  if (protectedUserPaths.some(path => pathname === path)) {
    if (!email || !role) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search)
      loginUrl.searchParams.set('message', 'Please login to continue booking')
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/seat-selection', '/checkout', '/tickets'],
}