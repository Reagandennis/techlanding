import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/about",
    "/programs",
    "/courses",
    "/accreditation",
    "/communities",
    "/resources",
    "/support",
    "/contact",
    "/consulting",
    "/development",
    "/recruitment",
    "/api/courses",
    "/api/webhooks(.*)",
  ],
  // Routes that require authentication
  protectedRoutes: [
    "/lms(.*)",
    "/dashboard(.*)",
    "/profile(.*)",
    "/admin(.*)",
    "/instructor(.*)",
    "/student(.*)",
  ],
  // Custom logic for LMS access control
  beforeAuth: (req) => {
    // Add custom security headers for LMS routes
    if (req.nextUrl.pathname.startsWith('/lms')) {
      const response = NextResponse.next()
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      return response
    }
  },
  afterAuth(auth, req) {
    // Handle users who aren't authenticated trying to access protected routes
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    
    // Redirect authenticated users trying to access LMS root to appropriate dashboard
    if (auth.userId && req.nextUrl.pathname === '/lms') {
      return NextResponse.redirect(new URL('/lms/student', req.url))
    }
    
    return NextResponse.next()
  },
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

