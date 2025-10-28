/**
 * Script to set up admin and instructor accounts
 * Run with: node scripts/setup-roles.js
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');
const path = require('path');

// Ensure we're using the correct Prisma client
const prisma = new PrismaClient();

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. PostgreSQL is running');
    console.log('   2. DATABASE_URL is set correctly in .env.local');
    console.log('   3. Run: npm run db:migrate');
    process.exit(1);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupRole() {
  try {
    console.log('🛠️  User Role Setup Script');
    console.log('============================\n');
    
    // Test database connection first
    await testConnection();

    const clerkId = await askQuestion('Enter Clerk User ID: ');
    
    if (!clerkId || !clerkId.startsWith('user_')) {
      console.log('❌ Invalid Clerk ID. Must start with "user_"');
      process.exit(1);
    }

    console.log('\nSelect role:');
    console.log('1. STUDENT');
    console.log('2. INSTRUCTOR');
    console.log('3. ADMIN');
    
    const roleChoice = await askQuestion('\nEnter choice (1-3): ');
    
    const roles = { '1': 'STUDENT', '2': 'INSTRUCTOR', '3': 'ADMIN' };
    const role = roles[roleChoice];
    
    if (!role) {
      console.log('❌ Invalid choice');
      process.exit(1);
    }

    const name = await askQuestion('Enter name (optional): ') || 'User';
    const email = await askQuestion('Enter email (optional): ') || `${clerkId}@example.com`;

    console.log(`\n📝 Setting up user:`);
    console.log(`   Clerk ID: ${clerkId}`);
    console.log(`   Role: ${role}`);
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email}\n`);

    // Create or update user
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {
        role,
        ...(name && { name }),
        ...(email && { email })
      },
      create: {
        clerkId,
        name,
        email,
        role
      }
    });

    console.log(`✅ Success! User role set to ${role}`);
    console.log(`👤 User ID: ${user.id}\n`);

    if (role === 'ADMIN') {
      console.log('🎉 Admin account created! You can now:');
      console.log('   • Access Admin Analytics: http://localhost:3000/admin/analytics');
      console.log('   • Manage users through the role management API');
    }

    if (role === 'INSTRUCTOR') {
      console.log('🎉 Instructor account created! You can now:');
      console.log('   • Access Instructor Dashboard: http://localhost:3000/lms/instructor'); 
      console.log('   • View Instructor Analytics: http://localhost:3000/instructor/analytics');
      console.log('   • Create and manage courses');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Run the script
setupRole();