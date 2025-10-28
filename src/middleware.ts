import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define role-based route protection
const PROTECTED_ROUTES = {
  ADMIN: [
    '/admin',
    '/lms/admin', 
    '/api/admin',
    '/api/lms/admin'
  ],
  INSTRUCTOR: [
    '/instructor',
    '/lms/instructor',
    '/api/instructor',
    '/api/lms/instructor'
  ],
  AUTHENTICATED: [
    '/dashboard',
    '/lms',
    '/student',
    '/profile'
  ]
}

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/blog',
  '/courses',
  '/programs',
  '/resources',
  '/careers',
  '/privacy',
  '/terms',
  '/auth',
  '/api/auth',
  '/api/webhooks'
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const pathname = req.nextUrl.pathname

  // Skip middleware for public routes and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  ) {
    return res
  }

  // Add security headers
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-XSS-Protection', '1; mode=block')

  try {
    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session, redirect to login for protected routes
    if (!session) {
      if (isProtectedRoute(pathname)) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/auth/login'
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
      }
      return res
    }

    // Get user profile with role from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const userRole = profile?.role || 'STUDENT'

    // Check role-based access
    if (requiresAdminAccess(pathname)) {
      if (userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    if (requiresInstructorAccess(pathname)) {
      if (!['INSTRUCTOR', 'ADMIN'].includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    if (requiresAuthentication(pathname)) {
      if (!session) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/auth/login'
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Redirect users to appropriate dashboard based on role
    if (pathname === '/lms' || pathname === '/dashboard') {
      switch (userRole) {
        case 'ADMIN':
          return NextResponse.redirect(new URL('/admin', req.url))
        case 'INSTRUCTOR':
          return NextResponse.redirect(new URL('/instructor', req.url))
        case 'STUDENT':
        default:
          return NextResponse.redirect(new URL('/student', req.url))
      }
    }

    // Add user role to headers for API routes
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-role', userRole)
    requestHeaders.set('x-user-id', session.user.id)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to login for protected routes
    if (isProtectedRoute(pathname)) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    return res
  }
}

function requiresAdminAccess(pathname: string): boolean {
  return PROTECTED_ROUTES.ADMIN.some(route => pathname.startsWith(route))
}

function requiresInstructorAccess(pathname: string): boolean {
  return PROTECTED_ROUTES.INSTRUCTOR.some(route => pathname.startsWith(route))
}

function requiresAuthentication(pathname: string): boolean {
  return PROTECTED_ROUTES.AUTHENTICATED.some(route => pathname.startsWith(route))
}

function isProtectedRoute(pathname: string): boolean {
  const allProtectedRoutes = [
    ...PROTECTED_ROUTES.ADMIN,
    ...PROTECTED_ROUTES.INSTRUCTOR, 
    ...PROTECTED_ROUTES.AUTHENTICATED
  ]
  return allProtectedRoutes.some(route => pathname.startsWith(route))
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};