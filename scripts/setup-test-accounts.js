#!/usr/bin/env node

/**
 * Setup Test Accounts for Supabase
 * 
 * This script creates test accounts for different user roles:
 * - Admin account
 * - Instructor account
 * - Student account (default)
 * 
 * Usage: node scripts/setup-test-accounts.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

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

async function setupTestAccounts() {
  // Initialize Supabase client with service role key for admin operations
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

  console.log('🚀 Setting up test accounts...\n');

  for (const account of TEST_ACCOUNTS) {
    try {
      console.log(`📝 Creating ${account.role} account: ${account.email}`);

      // Create the user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          name: account.name
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`   ⚠️  User already exists, updating profile...`);
          
          // Get existing user
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers.users.find(u => u.email === account.email);
          
          if (existingUser) {
            // Update profile with all required fields
            const now = new Date().toISOString();
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: existingUser.id,
                email: account.email,
                name: account.name,
                role: account.role,
                updatedAt: now,
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
              });

            if (profileError) {
              console.error(`   ❌ Error updating profile: ${profileError.message}`);
            } else {
              console.log(`   ✅ Profile updated successfully`);
            }
          }
        } else {
          console.error(`   ❌ Auth error: ${authError.message}`);
        }
        continue;
      }

      if (authUser.user) {
        // Create/update profile with all required fields
        const now = new Date().toISOString();
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authUser.user.id,
            email: account.email,
            name: account.name,
            role: account.role,
            createdAt: now,
            updatedAt: now,
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
          });

        if (profileError) {
          console.error(`   ❌ Profile error: ${profileError.message}`);
        } else {
          console.log(`   ✅ Account created successfully`);
        }
      }

    } catch (error) {
      console.error(`   ❌ Unexpected error: ${error.message}`);
    }
  }

  console.log('\n🎉 Test account setup complete!\n');
  
  console.log('📋 Account Summary:');
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
}

// Handle script execution
if (require.main === module) {
  setupTestAccounts().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { setupTestAccounts };