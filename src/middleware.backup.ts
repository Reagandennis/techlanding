import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define routes that require rate limiting
const apiRouteMatcher = createRouteMatcher({ path: '/api/:path*' });
const authRouteMatcher = createRouteMatcher({ path: '/api/auth/:path*' });
const paymentRouteMatcher = createRouteMatcher({ path: '/api/(lms/enrollment/payment|certificates)/:path*' });

// Store for rate limiting
const rateLimit = new Map();

// Security middleware that enhances the Clerk middleware
const securityMiddleware = (req: NextRequest) => {
  const res = NextResponse.next();
  
  // Add security headers
  const headers = res.headers;
  
  // Security headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Content Security Policy - adjust based on your needs
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.paystack.co https://clerk.techgetafrica.com https://cloudinary.com https://*.cloudinary.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.cloudinary.com https://clerk.techgetafrica.com; font-src 'self' data:; connect-src 'self' https://api.cloudinary.com https://clerk.techgetafrica.com https://api.paystack.co; frame-src 'self' https://js.paystack.co https://clerk.techgetafrica.com;"
  );
  
  // Add CSRF protection (relaxed for dev endpoints)
  const requestMethod = req.method;
  const isDevEndpoint = req.nextUrl.pathname.startsWith('/api/dev/');
  
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(requestMethod) && !isDevEndpoint) {
    const requestOrigin = req.headers.get('origin');
    const host = req.headers.get('host');
    
    if (requestOrigin && host && !requestOrigin.includes(host) && !isAllowedOrigin(requestOrigin)) {
      console.log('CSRF blocked:', { requestOrigin, host, pathname: req.nextUrl.pathname });
      return new NextResponse('CSRF protection: Invalid origin', { status: 403 });
    }
  }
  
  // Rate limiting for API routes (relaxed for dev endpoints)
  if (apiRouteMatcher(req) && !isDevEndpoint) {
    const ip = req.ip || 'unknown';
    const identifier = `${ip}:${req.nextUrl.pathname}`;
    
    // Different rate limits for different endpoints
    let maxRequests = 60; // Default: 60 requests per minute
    let windowMs = 60 * 1000; // 1 minute
    
    // Payment routes: stricter rate limits
    if (paymentRouteMatcher(req)) {
      maxRequests = 10; // 10 requests per minute
    }
    
    // Auth routes: moderate rate limits
    if (authRouteMatcher(req)) {
      maxRequests = 30; // 30 requests per minute
    }
    
    // Check rate limit
    const now = Date.now();
    const rateLimitInfo = rateLimit.get(identifier) || {
      count: 0,
      resetTime: now + windowMs,
    };
    
    // Clean up expired entries
    if (rateLimitInfo.resetTime <= now) {
      rateLimitInfo.count = 0;
      rateLimitInfo.resetTime = now + windowMs;
    }
    
    // Increment counter
    rateLimitInfo.count++;
    rateLimit.set(identifier, rateLimitInfo);
    
    // Add rate limit headers
    headers.set('X-RateLimit-Limit', maxRequests.toString());
    headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - rateLimitInfo.count).toString());
    headers.set('X-RateLimit-Reset', Math.ceil(rateLimitInfo.resetTime / 1000).toString());
    
    // Block if rate limit exceeded
    if (rateLimitInfo.count > maxRequests) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitInfo.resetTime - now) / 1000).toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(rateLimitInfo.resetTime / 1000).toString()
        }
      });
    }
  }
  
  // Revalidate map every hour to prevent memory leaks
  if (rateLimit.size > 10000) { // If map gets too large
    const now = Date.now();
    for (const [key, value] of rateLimit.entries()) {
      if (value.resetTime < now) {
        rateLimit.delete(key);
      }
    }
  }
  
  return res;
};

// Helper function to check if the origin is allowed
function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = [
    'https://techgetafrica.com',
    'https://www.techgetafrica.com',
    'https://api.techgetafrica.com',
    'https://staging.techgetafrica.com',
    'http://localhost:3000',
    'http://localhost:3001' // Added for development
  ];
  
  return allowedOrigins.some(allowedOrigin => origin.startsWith(allowedOrigin));
}

// Combine Clerk middleware with our security middleware
export default function middleware(req: NextRequest) {
  const isDevEndpoint = req.nextUrl.pathname.startsWith('/api/dev/');
  
  if (isDevEndpoint) {
    console.log('=== Dev Endpoint Request ===');
    console.log('Path:', req.nextUrl.pathname);
    console.log('Method:', req.method);
    console.log('Origin:', req.headers.get('origin'));
    console.log('Host:', req.headers.get('host'));
  }
  
  // Apply security headers and rate limiting first
  const securityResponse = securityMiddleware(req);
  
  // If security middleware blocked the request, return that response
  if (securityResponse.status !== 200) {
    if (isDevEndpoint) {
      console.log('Security middleware blocked dev endpoint:', securityResponse.status);
    }
    return securityResponse;
  }
  
  // Otherwise, continue with Clerk middleware for authentication
  return clerkMiddleware()(req);
}

export const config = {
  matcher: ['/((?!.*\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
