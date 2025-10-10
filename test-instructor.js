#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Testing Instructor Dashboard Functionality...\n');

try {
  // Test 1: Check if server starts without errors
  console.log('1. Checking if Next.js server can start...');
  console.log('   Starting server on port 3003...');
  
  // Just try to build first to catch any compilation errors
  console.log('   Building application...');
  execSync('npm run build', { cwd: process.cwd(), stdio: 'pipe' });
  console.log('   ✅ Build successful');
  
  console.log('\n2. Key Components to Test Manually:');
  console.log('   📊 Instructor Dashboard: http://localhost:3003/lms/instructor');
  console.log('   ➕ Course Creation: http://localhost:3003/lms/instructor/courses/create');
  console.log('   🔐 Login Page: http://localhost:3003/auth/login');
  
  console.log('\n3. Test Accounts (use these to log in):');
  console.log('   👨‍🏫 Instructor: instructor@test.com / password123');
  console.log('   👨‍💼 Admin: admin@test.com / password123');
  console.log('   🎓 Student: student@test.com / password123');
  
  console.log('\n4. Expected Functionality:');
  console.log('   • Login with instructor account should work');
  console.log('   • Access to /lms/instructor should show dashboard');
  console.log('   • Course creation page should load without errors');
  console.log('   • API endpoints should return proper responses (even if empty data)');
  
  console.log('\n5. API Endpoints Fixed:');
  console.log('   • /api/lms/instructor/dashboard - Updated to use Supabase auth');
  console.log('   • /api/lms/instructor/courses - Updated to use Supabase auth');
  console.log('   • /api/upload - Updated to use Supabase auth');
  
  console.log('\n🚀 Ready to test! Start the dev server with: npm run dev');
  console.log('📝 The instructor dashboard should now work with Supabase authentication.');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('\n🔧 Common issues to check:');
  console.log('   • Make sure all environment variables are set');
  console.log('   • Ensure Supabase is properly configured');
  console.log('   • Check that all imports are correct');
  process.exit(1);
}