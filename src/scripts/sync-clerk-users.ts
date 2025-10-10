#!/usr/bin/env tsx

/**
 * Comprehensive User Sync Utility
 * 
 * This script syncs all Clerk users to your Prisma database
 * Usage: npx tsx src/scripts/sync-clerk-users.ts
 */

import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '../lib/prisma';
import { syncUserWithDatabase } from '../lib/user-db-sync';
import { UserRole } from '@prisma/client';

interface SyncStats {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  errorDetails: string[];
}

async function syncAllClerkUsers() {
  console.log('🚀 Starting Clerk user sync...\n');

  const stats: SyncStats = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    errorDetails: []
  };

  try {
    // Get all users from Clerk
    console.log('📥 Fetching users from Clerk...');
    const clerkUsers = await clerkClient.users.getUserList({
      limit: 500, // Adjust as needed
    });

    stats.total = clerkUsers.data.length;
    console.log(`Found ${stats.total} users in Clerk\n`);

    // Get existing users from database for comparison
    const existingUsers = await prisma.user.findMany({
      select: {
        clerkId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    console.log(`Found ${existingUsers.length} users in database\n`);

    // Show users that exist in Clerk but not in database
    const missingUsers = clerkUsers.data.filter(clerkUser => 
      !existingUsers.some(dbUser => dbUser.clerkId === clerkUser.id)
    );

    if (missingUsers.length > 0) {
      console.log(`🔍 Found ${missingUsers.length} users in Clerk not synced to database:`);
      missingUsers.forEach(user => {
        const email = user.emailAddresses[0]?.emailAddress;
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
        console.log(`  - ${name} (${email}) - ID: ${user.id}`);
      });
      console.log('');
    }

    // Process each user
    console.log('🔄 Starting sync process...\n');
    
    for (let i = 0; i < clerkUsers.data.length; i++) {
      const clerkUser = clerkUsers.data[i];
      const email = clerkUser.emailAddresses[0]?.emailAddress || 'No email';
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || 'No name';
      
      console.log(`[${i + 1}/${stats.total}] Processing: ${name} (${email})`);

      try {
        const syncResult = await syncUserWithDatabase(clerkUser);
        
        if (syncResult) {
          if (syncResult.isNewUser) {
            stats.created++;
            console.log(`  ✅ Created new user with role: ${syncResult.user.role}`);
          } else {
            stats.updated++;
            console.log(`  🔄 Updated existing user with role: ${syncResult.user.role}`);
          }
        } else {
          stats.skipped++;
          console.log(`  ⏭️ Skipped (no sync result)`);
        }
      } catch (error) {
        stats.errors++;
        const errorMsg = `Error syncing user ${clerkUser.id} (${email}): ${error.message}`;
        stats.errorDetails.push(errorMsg);
        console.log(`  ❌ ${errorMsg}`);
      }

      console.log(''); // Add spacing between users
    }

    // Final report
    console.log('📊 SYNC COMPLETE! Final Report:');
    console.log('================================');
    console.log(`Total Users Processed: ${stats.total}`);
    console.log(`✅ Created: ${stats.created}`);
    console.log(`🔄 Updated: ${stats.updated}`);
    console.log(`⏭️ Skipped: ${stats.skipped}`);
    console.log(`❌ Errors: ${stats.errors}`);

    if (stats.errorDetails.length > 0) {
      console.log('\n❌ Error Details:');
      stats.errorDetails.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    // Show role distribution
    console.log('\n👥 Final Role Distribution:');
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });

    roleStats.forEach(stat => {
      console.log(`${stat.role}: ${stat._count.role}`);
    });

    console.log('\n✅ Sync completed successfully!');

  } catch (error) {
    console.error('❌ Fatal error during sync:', error);
    process.exit(1);
  }
}

// Show current state before sync
async function showCurrentState() {
  console.log('📋 Current Database State:');
  console.log('==========================');

  try {
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });

    const total = userStats.reduce((sum, stat) => sum + stat._count.role, 0);
    console.log(`Total users in database: ${total}`);

    userStats.forEach(stat => {
      console.log(`${stat.role}: ${stat._count.role}`);
    });

    // Show recent users
    const recentUsers = await prisma.user.findMany({
      select: {
        clerkId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    if (recentUsers.length > 0) {
      console.log('\n📝 Most Recent Users:');
      recentUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user.role} - ${user.createdAt.toDateString()}`);
      });
    }

    console.log('');
  } catch (error) {
    console.error('Error fetching current state:', error);
  }
}

// Main execution
async function main() {
  console.log('🔄 Clerk-Prisma User Sync Utility');
  console.log('==================================\n');

  await showCurrentState();
  
  // Ask for confirmation in production
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️ Running in production mode. Are you sure you want to continue?');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  await syncAllClerkUsers();
  
  console.log('\n🏁 Process completed. You can now use Prisma Studio to manage user roles:');
  console.log('   npx prisma studio');
  
  await prisma.$disconnect();
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

export { syncAllClerkUsers, showCurrentState };