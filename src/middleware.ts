import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'
import { canAccessRoute } from '@/lib/permissions'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user
  const userRole = (session?.user as any)?.role

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isAuthRoute = nextUrl.pathname.startsWith('/auth')
  const isApiAdminRoute = nextUrl.pathname.startsWith('/api/admin')

  // Protect admin API routes
  if (isApiAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 })
    }
    const routeEquivalent = nextUrl.pathname.replace('/api', '')
    if (!canAccessRoute(userRole, routeEquivalent)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions for this resource' }, { status: 403 })
    }
    return NextResponse.next()
  }

  // Redirect logged-in users away from auth pages to dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based route authorization
    if (!canAccessRoute(userRole, nextUrl.pathname)) {
      const forbiddenUrl = new URL('/admin/forbidden', req.url)
      return NextResponse.redirect(forbiddenUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/auth/:path*',
  ],
}
