import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getCurrentUserWithSync } from '@/lib/user-db-sync';
import { prisma } from '@/lib/prisma';

// TEMPORARY ENDPOINT FOR TESTING USER SYNC - REMOVE IN PRODUCTION
export async function GET(request: NextRequest) {
  try {
    console.log('=== Test Sync GET Request ===');
    
    // Try multiple authentication methods
    const authResult = auth();
    console.log('auth() result:', { userId: authResult?.userId, sessionId: authResult?.sessionId });
    
    const user = await currentUser();
    console.log('currentUser() result:', user ? { id: user.id, email: user.emailAddresses[0]?.emailAddress } : null);
    
    const clerkId = authResult?.userId || user?.id;
    
    if (!clerkId) {
      console.log('❌ No authentication found');
      return NextResponse.json(
        { 
          error: 'Not authenticated',
          debug: {
            authResult: authResult,
            currentUserExists: !!user,
            headers: Object.fromEntries(request.headers.entries())
          }
        },
        { status: 401 }
      );
    }
    
    console.log('✅ Authentication successful:', clerkId);

    // Test the sync function
    const syncResult = await getCurrentUserWithSync();

    if (!syncResult) {
      return NextResponse.json(
        { error: 'Sync failed' },
        { status: 500 }
      );
    }

    // Get all users for comparison
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      success: true,
      currentUser: {
        clerkId,
        syncedUser: syncResult.user,
        isNewUser: syncResult.isNewUser,
      },
      allUsers,
      message: syncResult.isNewUser ? 
        'User was created and synced to database' : 
        'User already exists and was updated'
    });

  } catch (error) {
    console.error('Test sync error:', error);
    return NextResponse.json(
      { error: 'Test sync failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Test Sync POST Request ===');
    
    const authResult = auth();
    const user = await currentUser();
    const clerkId = authResult?.userId || user?.id;
    
    console.log('POST auth check:', { clerkId, hasUser: !!user });

    if (!clerkId) {
      console.log('❌ POST: No authentication found');
      return NextResponse.json(
        { 
          error: 'Not authenticated',
          debug: { authResult, currentUserExists: !!user }
        },
        { status: 401 }
      );
    }

    // Force a fresh sync
    const syncResult = await getCurrentUserWithSync();

    return NextResponse.json({
      success: true,
      result: syncResult,
      message: 'User sync completed'
    });

  } catch (error) {
    console.error('Force sync error:', error);
    return NextResponse.json(
      { error: 'Force sync failed', details: error.message },
      { status: 500 }
    );
  }
}