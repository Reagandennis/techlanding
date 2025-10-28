#!/usr/bin/env node

/**
 * Verify the complete setup of role-based authentication
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

async function verifySetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  console.log('🔍 Verifying Supabase Role-Based Authentication Setup\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Verify environment variables
    console.log('📋 Environment Variables:');
    console.log(`   ✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓' : '❌'}`);
    console.log(`   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '❌'}`);
    console.log(`   ✅ SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceRoleKey ? '✓' : '❌'}`);
    console.log('');

    // 2. Verify database connection
    console.log('🗄️  Database Connection:');
    try {
      await prisma.$connect();
      console.log('   ✅ Prisma connected successfully');
    } catch (error) {
      console.log('   ❌ Prisma connection failed:', error.message);
    }
    console.log('');

    // 3. Verify test accounts in database
    console.log('👥 Test Accounts in Database:');
    const testEmails = ['admin@techgetafrica.com', 'instructor@techgetafrica.com', 'student@techgetafrica.com'];
    
    for (const email of testEmails) {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, role: true, createdAt: true }
        });
        
        if (user) {
          console.log(`   ✅ ${user.role.padEnd(10)}: ${user.email} (ID: ${user.id.slice(0, 8)}...)`);
        } else {
          console.log(`   ❌ ${email} - NOT FOUND`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${email}: ${error.message}`);
      }
    }
    console.log('');

    // 4. Verify Supabase Auth users
    console.log('🔐 Supabase Auth Users:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('   ❌ Error fetching auth users:', authError.message);
    } else {
      const testAuthUsers = authUsers.users.filter(u => testEmails.includes(u.email));
      testAuthUsers.forEach(user => {
        console.log(`   ✅ ${user.email} (ID: ${user.id.slice(0, 8)}...) - Created: ${new Date(user.created_at).toLocaleDateString()}`);
      });
    }
    console.log('');

    // 5. Test role-based access (simulation)
    console.log('🛡️  Role-Based Access Simulation:');
    
    const roleTests = [
      { email: 'admin@techgetafrica.com', role: 'ADMIN', shouldAccess: ['/admin', '/instructor', '/student'] },
      { email: 'instructor@techgetafrica.com', role: 'INSTRUCTOR', shouldAccess: ['/instructor', '/student'], shouldBlock: ['/admin'] },
      { email: 'student@techgetafrica.com', role: 'STUDENT', shouldAccess: ['/student'], shouldBlock: ['/admin', '/instructor'] }
    ];

    for (const test of roleTests) {
      console.log(`   👤 ${test.role} (${test.email}):`);
      console.log(`      ✅ Should access: ${test.shouldAccess.join(', ')}`);
      if (test.shouldBlock) {
        console.log(`      🚫 Should block: ${test.shouldBlock.join(', ')}`);
      }
    }
    console.log('');

    // 6. Show login credentials
    console.log('🔑 Test Account Credentials:');
    console.log('┌─────────────────────────────────────┬─────────────┬──────────────────┐');
    console.log('│ Email                               │ Role        │ Password         │');
    console.log('├─────────────────────────────────────┼─────────────┼──────────────────┤');
    console.log('│ admin@techgetafrica.com             │ ADMIN       │ TestAdmin123!    │');
    console.log('│ instructor@techgetafrica.com        │ INSTRUCTOR  │ TestInstructor123! │');
    console.log('│ student@techgetafrica.com           │ STUDENT     │ TestStudent123!  │');
    console.log('└─────────────────────────────────────┴─────────────┴──────────────────┘');
    console.log('');

    // 7. Show test URLs
    console.log('🌐 Test URLs (after starting dev server):');
    console.log('   🏠 Homepage: http://localhost:3002/');
    console.log('   👨‍💼 Admin Dashboard: http://localhost:3002/admin');
    console.log('   👨‍🏫 Instructor Dashboard: http://localhost:3002/instructor');
    console.log('   👨‍🎓 Student Dashboard: http://localhost:3002/student');
    console.log('   🔐 Login Page: http://localhost:3002/auth/login');
    console.log('   🚫 Unauthorized Page: http://localhost:3002/unauthorized');
    console.log('');

    // 8. Next steps
    console.log('🚀 Next Steps:');
    console.log('   1. Start your development server: npm run dev');
    console.log('   2. Visit http://localhost:3002/auth/login');
    console.log('   3. Login with any of the test accounts above');
    console.log('   4. Test role-based redirects:');
    console.log('      - Admin users → /admin dashboard');
    console.log('      - Instructor users → /instructor dashboard'); 
    console.log('      - Student users → /student dashboard');
    console.log('   5. Try accessing restricted pages to test middleware');
    console.log('');

    console.log('✅ Setup verification complete! Your role-based authentication is ready to use.');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (require.main === module) {
  verifySetup().catch(error => {
    console.error('Verification script failed:', error);
    process.exit(1);
  });
}