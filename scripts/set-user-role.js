// Script to set user roles in the database
// Run this with: node scripts/set-user-role.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setUserRole() {
  try {
    // Replace with your Clerk user ID (you can find this in Clerk dashboard or browser dev tools when logged in)
    const clerkUserId = 'your-clerk-user-id-here'; // e.g., 'user_2ABC123XYZ'
    const role = 'ADMIN'; // Can be 'STUDENT', 'INSTRUCTOR', or 'ADMIN'
    
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
        name: 'Admin User', // Replace with actual name
        email: 'admin@example.com', // Replace with actual email
        role: role
      }
    });

    console.log(`✅ User role updated successfully:`, user);
    
  } catch (error) {
    console.error('❌ Error setting user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setUserRole();
