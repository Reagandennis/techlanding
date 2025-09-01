import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

export async function syncUserWithDatabase() {
  const { userId: clerkId } = auth()
  const clerkUser = await currentUser()
  
  if (!clerkId || !clerkUser) {
    return null
  }

  // Check if user exists in database
  let dbUser = await prisma.user.findUnique({
    where: { clerkId }
  })

  // Create user if doesn't exist
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || '',
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        image: clerkUser.imageUrl,
        role: UserRole.USER // Default role
      }
    })
  } else {
    // Update user info if it exists
    dbUser = await prisma.user.update({
      where: { clerkId },
      data: {
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || dbUser.name,
        email: clerkUser.emailAddresses[0]?.emailAddress || dbUser.email,
        image: clerkUser.imageUrl || dbUser.image,
      }
    })
  }

  return dbUser
}

export async function getUserRole(clerkId: string): Promise<UserRole | null> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { role: true }
  })
  
  return user?.role || null
}

export async function updateUserRole(clerkId: string, role: UserRole) {
  return await prisma.user.update({
    where: { clerkId },
    data: { role }
  })
}

export async function getCurrentUserWithRole() {
  const user = await syncUserWithDatabase()
  return user
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.USER]: 0,
    [UserRole.STUDENT]: 1,
    [UserRole.INSTRUCTOR]: 2,
    [UserRole.ADMIN]: 3
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function canAccessLMSSection(userRole: UserRole, section: 'student' | 'instructor' | 'admin'): boolean {
  switch (section) {
    case 'student':
      return hasPermission(userRole, UserRole.STUDENT)
    case 'instructor':
      return hasPermission(userRole, UserRole.INSTRUCTOR)
    case 'admin':
      return hasPermission(userRole, UserRole.ADMIN)
    default:
      return false
  }
}
