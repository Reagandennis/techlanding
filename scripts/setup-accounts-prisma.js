#!/usr/bin/env node

/**
 * Setup Test Accounts using Prisma + Supabase
 * This script creates accounts properly using Prisma schema
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

// Test account configurations
const TEST_ACCOUNTS = [
  {
    email: 'admin@techgetafrica.com',
    password: 'TestAdmin123!',
    role: 'ADMIN',
    name: 'System Administrator'
  },
  {
    email: 'instructor@techgetafrica.com',
    password: 'TestInstructor123!',
    role: 'INSTRUCTOR',
    name: 'Course Instructor'
  },
  {
    email: 'student@techgetafrica.com',
    password: 'TestStudent123!',
    role: 'STUDENT',
    name: 'Test Student'
  }
];

async function setupAccountsWithPrisma() {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Required variables:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🚀 Setting up test accounts with Prisma...\n');

  try {
    for (const account of TEST_ACCOUNTS) {
      console.log(`📝 Creating ${account.role} account: ${account.email}`);

      // Step 1: Create auth user in Supabase
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          name: account.name
        }
      });

      let userId;
      
      if (authError && authError.message.includes('already registered')) {
        console.log(`   ⚠️  User already exists, finding existing user...`);
        // User already exists, get the ID
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === account.email);
        
        if (existingUser) {
          userId = existingUser.id;
          console.log(`   ✅ Found existing user with ID: ${userId}`);
        } else {
          console.error(`   ❌ Could not find existing user`);
          continue;
        }
      } else if (authError) {
        console.error(`   ❌ Auth error: ${authError.message}`);
        continue;
      } else if (authUser?.user) {
        userId = authUser.user.id;
        console.log(`   ✅ Auth user created with ID: ${userId}`);
      } else {
        console.error(`   ❌ Could not create or find user`);
        continue;
      }

      // Step 2: Create profile using Prisma
      try {
        const profile = await prisma.user.upsert({
          where: { id: userId },
          update: {
            email: account.email,
            name: account.name,
            role: account.role,
            updatedAt: new Date()
          },
          create: {
            id: userId,
            email: account.email,
            name: account.name,
            role: account.role,
            totalPoints: 0,
            currentStreak: 0,
            longestStreak: 0,
            emailNotifications: true,
            pushNotifications: true,
            marketingEmails: false,
            learningGoals: [],
            interests: [],
            timezone: 'UTC',
            language: 'en'
          }
        });

        console.log(`   ✅ Profile created/updated successfully`);
      } catch (profileError) {
        console.error(`   ❌ Profile error: ${profileError.message}`);
      }
    }

    console.log('\n🎉 Test account setup complete!\n');
    
    // Verify accounts
    console.log('📋 Verifying created accounts:');
    for (const account of TEST_ACCOUNTS) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: account.email },
          select: { id: true, email: true, name: true, role: true, createdAt: true }
        });
        
        if (user) {
          console.log(`✅ ${account.role}: ${user.email} (${user.role}) - Created: ${user.createdAt.toISOString()}`);
        } else {
          console.log(`❌ ${account.role}: ${account.email} - NOT FOUND`);
        }
      } catch (error) {
        console.error(`❌ Error checking ${account.email}: ${error.message}`);
      }
    }
    
    console.log('\n📋 Account Summary:');
    console.log('┌─────────────────────────────────────┬─────────────┬──────────────────┐');
    console.log('│ Email                               │ Role        │ Password         │');
    console.log('├─────────────────────────────────────┼─────────────┼──────────────────┤');
    
    TEST_ACCOUNTS.forEach(account => {
      console.log(`│ ${account.email.padEnd(35)} │ ${account.role.padEnd(11)} │ ${account.password.padEnd(16)} │`);
    });
    
    console.log('└─────────────────────────────────────┴─────────────┴──────────────────┘\n');
    
    console.log('🔐 Login URLs:');
    console.log(`Admin Dashboard: http://localhost:3002/admin`);
    console.log(`Instructor Dashboard: http://localhost:3002/instructor`);
    console.log(`Student Dashboard: http://localhost:3002/student\n`);
    
    console.log('⚠️  Important Security Notes:');
    console.log('- Change these passwords in production');
    console.log('- These are test accounts only');
    console.log('- Never commit real credentials to version control');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (require.main === module) {
  setupAccountsWithPrisma().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { setupAccountsWithPrisma };