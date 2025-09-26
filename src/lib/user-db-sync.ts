import { prisma } from './prisma';
import { UserRole } from '@prisma/client';
import { currentUser, User as ClerkUser } from '@clerk/nextjs/server';

export interface UserSyncResult {
  user: {
    id: string;
    clerkId: string;
    name: string | null;
    email: string | null;
    role: UserRole;
    image: string | null;
  };
  isNewUser: boolean;
}

/**
 * Synchronizes a Clerk user with our database
 * Creates new user if doesn't exist, updates existing user info
 */
export async function syncUserWithDatabase(clerkUser: ClerkUser): Promise<UserSyncResult> {
  const clerkId = clerkUser.id;
  const primaryEmail = clerkUser.emailAddresses.find(email => 
    email.id === clerkUser.primaryEmailAddressId
  );

  const userData = {
    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 
          clerkUser.username || 
          primaryEmail?.emailAddress?.split('@')[0] || 
          'User',
    email: primaryEmail?.emailAddress || null,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    image: clerkUser.imageUrl,
  };

  try {
    // Try to find existing user
    const existingUser = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (existingUser) {
      // Update existing user (but preserve manually set roles)
      const updatedUser = await prisma.user.update({
        where: { clerkId },
        data: {
          ...userData,
          // Only auto-upgrade USER role to STUDENT, preserve other manually set roles
          ...(existingUser.role === UserRole.USER && { role: UserRole.STUDENT }),
        }
      });

      console.log(`✅ User updated in database: ${clerkId}`);

      return {
        user: {
          id: updatedUser.id,
          clerkId: updatedUser.clerkId,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          image: updatedUser.image,
        },
        isNewUser: false
      };
    } else {
      // Create new user with smart role assignment
      const smartRole = determineUserRole(userData.email || '', userData.firstName, userData.lastName);
      
      const newUser = await prisma.user.create({
        data: {
          clerkId,
          ...userData,
          role: smartRole,
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
        }
      });

      console.log(`✅ New user created in database: ${clerkId} with role: ${smartRole}`);

      return {
        user: {
          id: newUser.id,
          clerkId: newUser.clerkId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          image: newUser.image,
        },
        isNewUser: true
      };
    }
  } catch (error) {
    console.error('❌ Error syncing user with database:', error);
    throw error;
  }
}

/**
 * Gets the current user from Clerk and syncs with database
 */
export async function getCurrentUserWithSync(): Promise<UserSyncResult | null> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    return await syncUserWithDatabase(clerkUser);
  } catch (error) {
    console.error('❌ Error getting current user with sync:', error);
    return null;
  }
}

/**
 * Auto-assign roles based on email domain or other criteria
 */
export function determineUserRole(email: string, firstName?: string | null, lastName?: string | null): UserRole {
  if (!email) return UserRole.STUDENT;

  const emailLower = email.toLowerCase();
  const name = `${firstName || ''} ${lastName || ''}`.toLowerCase();

  // Admin criteria (very specific)
  if (emailLower.includes('admin@') || 
      emailLower.endsWith('@admin.com') || 
      name.includes('admin')) {
    return UserRole.ADMIN;
  }

  // Instructor criteria
  if (emailLower.includes('instructor@') || 
      emailLower.includes('teacher@') ||
      emailLower.includes('prof@') ||
      emailLower.includes('faculty@') ||
      emailLower.endsWith('.edu') ||
      name.includes('instructor') ||
      name.includes('teacher') ||
      name.includes('professor') ||
      name.includes('faculty')) {
    return UserRole.INSTRUCTOR;
  }

  // Default to student for everyone else
  return UserRole.STUDENT;
}

/**
 * Ensure user exists in database and return their info
 */
export async function ensureUserInDatabase(): Promise<UserSyncResult | null> {
  try {
    return await getCurrentUserWithSync();
  } catch (error) {
    console.error('❌ Error ensuring user in database:', error);
    return null;
  }
}

/**
 * Batch sync function for migrating existing Clerk users
 */
export async function batchSyncExistingUsers(): Promise<{
  synced: number;
  created: number;
  updated: number;
  errors: string[];
}> {
  // This would require a Clerk admin API call to list all users
  // Implementation depends on your Clerk setup and requirements
  return { synced: 0, created: 0, updated: 0, errors: ['Not implemented'] };
}