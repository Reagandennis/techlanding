#!/usr/bin/env node

/**
 * Create Profiles for existing Supabase auth users
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

// Test account configurations
const TEST_ACCOUNTS = [
  {
    email: 'admin@techgetafrica.com',
    role: 'ADMIN',
    name: 'System Administrator'
  },
  {
    email: 'instructor@techgetafrica.com',
    role: 'INSTRUCTOR',
    name: 'Course Instructor'
  },
  {
    email: 'student@techgetafrica.com',
    role: 'STUDENT',
    name: 'Test Student'
  }
];

async function createProfiles() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('🔍 Getting existing Supabase auth users...\n');

  try {
    // Get all users from Supabase auth
    const { data: allUsers, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error getting users:', error.message);
      return;
    }

    console.log(`📋 Found ${allUsers.users.length} users in Supabase Auth:`);
    allUsers.users.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
    });
    console.log('');

    // Create profiles for our test accounts
    for (const account of TEST_ACCOUNTS) {
      const user = allUsers.users.find(u => u.email === account.email);
      
      if (!user) {
        console.log(`❌ ${account.email} - Not found in auth users`);
        continue;
      }

      console.log(`📝 Creating profile for ${account.email} (${user.id})`);

      try {
        const profile = await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: account.email,
            name: account.name,
            role: account.role,
            updatedAt: new Date()
          },
          create: {
            id: user.id,
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

        console.log(`   ✅ Profile created successfully: ${profile.email} (${profile.role})`);
      } catch (profileError) {
        console.error(`   ❌ Profile error: ${profileError.message}`);
        console.error(`   Debug: ${profileError.stack}`);
      }
    }

    console.log('\n🔍 Verifying profiles in database...');
    
    for (const account of TEST_ACCOUNTS) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: account.email },
          select: { id: true, email: true, name: true, role: true, createdAt: true }
        });
        
        if (user) {
          console.log(`✅ ${account.role}: ${user.email} (${user.role})`);
        } else {
          console.log(`❌ ${account.role}: ${account.email} - NOT FOUND in database`);
        }
      } catch (error) {
        console.error(`❌ Error checking ${account.email}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (require.main === module) {
  createProfiles().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}