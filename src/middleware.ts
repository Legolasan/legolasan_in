import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname

    // Allow access to login pages
    if (pathname === '/admin/login' || pathname === '/blogs/admin/login') {
      return NextResponse.next()
    }

    // Redirect old blogs/admin/login to new /admin/login
    if (pathname === '/blogs/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Admin routes require admin role
    if (pathname.startsWith('/admin') || pathname.startsWith('/blogs/admin')) {
      const role = req.nextauth.token?.role

      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Always allow login pages
        if (pathname === '/admin/login' || pathname === '/blogs/admin/login') {
          return true
        }

        // Admin routes need token with admin role
        if (pathname.startsWith('/admin') || pathname.startsWith('/blogs/admin')) {
          return token?.role === 'admin'
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/blogs/admin/:path*'],
}
