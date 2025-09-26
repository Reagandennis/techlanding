import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { syncUserWithDatabase } from '@/lib/user-db-sync';
import { prisma } from '@/lib/prisma';

// TEMPORARY ENDPOINT FOR SYNCING EXISTING USERS - REMOVE IN PRODUCTION
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get all users from Clerk
    const clerkUsers = await clerkClient.users.getUserList({
      limit: 100, // Adjust as needed
    });

    console.log(`Found ${clerkUsers.data.length} users in Clerk`);

    const results = {
      total: clerkUsers.data.length,
      synced: 0,
      created: 0,
      updated: 0,
      errors: [] as string[],
      users: [] as any[],
    };

    // Sync each user
    for (const clerkUser of clerkUsers.data) {
      try {
        console.log(`Syncing user: ${clerkUser.id} - ${clerkUser.emailAddresses[0]?.emailAddress}`);
        
        const syncResult = await syncUserWithDatabase(clerkUser);
        
        if (syncResult) {
          results.synced++;
          if (syncResult.isNewUser) {
            results.created++;
          } else {
            results.updated++;
          }
          
          results.users.push({
            clerkId: clerkUser.id,
            email: syncResult.user.email,
            name: syncResult.user.name,
            role: syncResult.user.role,
            isNewUser: syncResult.isNewUser,
          });
        }
      } catch (error) {
        const errorMsg = `Failed to sync user ${clerkUser.id}: ${error.message}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    console.log('Sync completed:', results);

    return NextResponse.json({
      success: true,
      results,
      message: `Sync completed: ${results.created} created, ${results.updated} updated`
    });

  } catch (error) {
    console.error('Bulk sync error:', error);
    return NextResponse.json(
      { error: 'Bulk sync failed', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check current database state
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get users from both Clerk and database
    const [clerkUsers, dbUsers] = await Promise.all([
      clerkClient.users.getUserList({ limit: 100 }),
      prisma.user.findMany({
        select: {
          clerkId: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const comparison = {
      clerk: {
        total: clerkUsers.data.length,
        users: clerkUsers.data.map(u => ({
          id: u.id,
          email: u.emailAddresses[0]?.emailAddress,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
          createdAt: u.createdAt,
        }))
      },
      database: {
        total: dbUsers.length,
        users: dbUsers
      },
      missing: clerkUsers.data.filter(cu => 
        !dbUsers.some(du => du.clerkId === cu.id)
      ).map(u => ({
        id: u.id,
        email: u.emailAddresses[0]?.emailAddress,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
      }))
    };

    return NextResponse.json({
      success: true,
      comparison,
      message: `Found ${comparison.missing.length} users in Clerk not synced to database`
    });

  } catch (error) {
    console.error('Comparison error:', error);
    return NextResponse.json(
      { error: 'Comparison failed', details: error.message },
      { status: 500 }
    );
  }
}