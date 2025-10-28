import { createMiddlewareClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '@/types/supabase'

// Define protected routes
const protectedRoutes = [
  '/lms',
  '/dashboard',
  '/profile',
  '/admin',
  '/instructor',
  '/student'
]

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/programs',
  '/courses',
  '/accreditation',
  '/communities',
  '/resources',
  '/support',
  '/contact',
  '/consulting',
  '/development',
  '/recruitment',
  '/api/courses',
  '/api/webhooks',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/callback',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password'
]

// Define role-specific route access
const roleRoutes: Record<string, UserRole[]> = {
  '/admin': ['ADMIN'],
  '/instructor': ['INSTRUCTOR', 'ADMIN'],
  '/lms/instructor': ['INSTRUCTOR', 'ADMIN'],
  '/lms/admin': ['ADMIN']
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route))
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

function hasRequiredRole(pathname: string, userRole: UserRole): boolean {
  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(userRole)
    }
  }
  return true // No specific role requirement
}

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient(request, response)
  const { pathname } = request.nextUrl

  // Add security headers for LMS routes
  if (pathname.startsWith('/lms')) {
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }

  // Skip middleware for public routes and API routes
  if (isPublicRoute(pathname) || pathname.startsWith('/api/')) {
    return response
  }

  try {
    // Get the session
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting session:', error)
      return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }

    // Redirect unauthenticated users to sign-in
    if (!session && isProtectedRoute(pathname)) {
      const redirectUrl = new URL('/auth/sign-in', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is authenticated, get their profile for role checking
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        // Check role-based access
        if (!hasRequiredRole(pathname, profile.role)) {
          return NextResponse.redirect(new URL('/lms/unauthorized', request.url))
        }

        // Redirect to appropriate dashboard based on role
        if (pathname === '/lms') {
          switch (profile.role) {
            case 'ADMIN':
              return NextResponse.redirect(new URL('/lms/admin', request.url))
            case 'INSTRUCTOR':
              return NextResponse.redirect(new URL('/lms/instructor', request.url))
            case 'STUDENT':
            default:
              return NextResponse.redirect(new URL('/lms/student', request.url))
          }
        }

        // Redirect authenticated users away from auth pages
        if (pathname.startsWith('/auth/') && !pathname.includes('callback')) {
          switch (profile.role) {
            case 'ADMIN':
              return NextResponse.redirect(new URL('/lms/admin', request.url))
            case 'INSTRUCTOR':
              return NextResponse.redirect(new URL('/lms/instructor', request.url))
            case 'STUDENT':
            default:
              return NextResponse.redirect(new URL('/lms/student', request.url))
          }
        }
      }
    }
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

