import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Conditional middleware that skips Clerk on localhost when using production keys
export default clerkMiddleware((auth, req: NextRequest) => {
  const hostname = req.headers.get('host') || '';
  
  // Skip Clerk middleware on localhost if we detect production keys issue
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
    
    // If using production keys on localhost, skip Clerk middleware to prevent errors
    if (publishableKey.startsWith('pk_live_')) {
      console.warn('⚠️  Skipping Clerk middleware on localhost due to production keys. Get development keys from Clerk dashboard.');
      return; // Skip Clerk middleware
    }
  }
  
  // Normal Clerk middleware for production or when development keys are configured
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

