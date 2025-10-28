import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Middleware helper to ensure user is auto-synced to database
 * Call this from your main middleware or route handlers
 */
export async function ensureUserSyncMiddleware(request: NextRequest): Promise<NextResponse | null> {
  try {
    const { userId } = auth();
    
    // Only sync for authenticated users
    if (!userId) {
      return null; // Let request continue
    }

    // Check if this is an API route - we want to avoid syncing on every API call
    const isApiRoute = request.nextUrl.pathname.startsWith('/api');
    const isSyncRoute = request.nextUrl.pathname === '/api/user/sync';
    
    // Skip sync for API routes to avoid unnecessary database calls
    if (isApiRoute && !isSyncRoute) {
      return null;
    }

    // For non-API routes, we can trigger a sync call
    if (!isApiRoute) {
      // Trigger sync in background (fire and forget)
      fetch(`${request.nextUrl.origin}/api/user/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Forward the authorization header
          'Authorization': request.headers.get('Authorization') || '',
        },
      }).catch(error => {
        console.error('Background user sync failed:', error);
      });
    }

    return null; // Let request continue
  } catch (error) {
    console.error('Error in auto-sync middleware:', error);
    return null; // Don't block the request even if sync fails
  }
}

/**
 * Route handler wrapper that ensures user sync before processing
 */
export function withUserSync(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      const { userId } = auth();
      
      if (userId) {
        // Trigger sync for authenticated users
        try {
          await fetch(`${req.nextUrl.origin}/api/user/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (syncError) {
          console.error('User sync failed in route handler:', syncError);
          // Continue with the request even if sync fails
        }
      }
      
      return await handler(req, ...args);
    } catch (error) {
      console.error('Error in withUserSync wrapper:', error);
      return await handler(req, ...args); // Fallback to original handler
    }
  };
}