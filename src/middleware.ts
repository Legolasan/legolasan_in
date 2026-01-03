import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Allow access to login page
    if (req.nextUrl.pathname === '/blogs/admin/login') {
      return NextResponse.next()
    }

    // Admin routes require admin role (token is guaranteed by authorized callback)
    if (req.nextUrl.pathname.startsWith('/blogs/admin')) {
      const role = req.nextauth.token?.role
      console.log('[MIDDLEWARE] Admin check:', { path: req.nextUrl.pathname, role })
      
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/blogs/admin/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Always allow login page
        if (req.nextUrl.pathname === '/blogs/admin/login') {
          return true
        }
        
        // Admin routes need token with admin role
        if (req.nextUrl.pathname.startsWith('/blogs/admin')) {
          console.log('[MIDDLEWARE] Auth check:', { hasToken: !!token, role: token?.role })
          return token?.role === 'admin'
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/blogs/admin/:path*'],
}

