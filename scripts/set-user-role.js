// Script to set user roles in the database
// Run this with: node scripts/set-user-role.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setUserRole() {
  try {
    // STEP 1: Replace with your actual Clerk user ID
    const clerkUserId = process.env.CLERK_USER_ID || 'your-clerk-user-id-here';
    
    // STEP 2: Set the role you want
    const role = process.env.USER_ROLE || 'ADMIN'; // Can be 'USER', 'INSTRUCTOR', or 'ADMIN'
    
    console.log(`🔄 Setting role "${role}" for user: ${clerkUserId}`);
    
    // Create or update user with role
    const user = await prisma.user.upsert({
      where: {
        clerkId: clerkUserId
      },
      update: {
        role: role
      },
      create: {
        clerkId: clerkUserId,
        name: role === 'ADMIN' ? 'Admin User' : role === 'INSTRUCTOR' ? 'Instructor User' : 'Student User',
        email: `${role.toLowerCase()}@techgetafrica.com`,
        role: role
      }
    });

    console.log(`✅ User role updated successfully:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Clerk ID: ${user.clerkId}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email: ${user.email}`);
    
    // Show what URLs they can access
    console.log(`\n🌐 Available URLs for ${role}:`);
    console.log(`   Homepage: https://techgetafrica.com/`);
    console.log(`   LMS Courses: https://techgetafrica.com/lms/courses`);
    
    if (role === 'ADMIN' || role === 'INSTRUCTOR') {
      console.log(`   Instructor Dashboard: https://techgetafrica.com/instructor/dashboard`);
    }
    
    if (role === 'ADMIN') {
      console.log(`   Admin Panel: https://techgetafrica.com/admin`);
    }
    
    console.log(`   Profile: https://techgetafrica.com/profile`);
    
  } catch (error) {
    console.error('❌ Error setting user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setUserRole();
