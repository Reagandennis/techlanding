import { auth, currentUser } from '@clerk/nextjs'
import { User } from '@clerk/nextjs/server'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  [UserRole.USER]: 0,
  [UserRole.STUDENT]: 1,
  [UserRole.INSTRUCTOR]: 2,
  [UserRole.ADMIN]: 3,
}

export interface AuthUser {
  id: string
  clerkId: string
  email: string | null
  name: string | null
  image: string | null
  role: UserRole
  firstName?: string | null
  lastName?: string | null
}

/**
 * Get current authenticated user with database profile
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { userId } = auth()
  
  if (!userId) {
    return null
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        image: true,
        role: true,
      }
    })

    return dbUser
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

/**
 * Require authentication - redirect to sign-in if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  return user
}

/**
 * Check if user has required role or higher
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Require specific role - redirect if insufficient permissions
 */
export async function requireRole(requiredRole: UserRole): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (!hasRole(user.role, requiredRole)) {
    redirect('/unauthorized')
  }
  
  return user
}

/**
 * Check if user is admin
 */
export async function requireAdmin(): Promise<AuthUser> {
  return requireRole(UserRole.ADMIN)
}

/**
 * Check if user is instructor or admin
 */
export async function requireInstructor(): Promise<AuthUser> {
  return requireRole(UserRole.INSTRUCTOR)
}

/**
 * Check if user can access course (enrolled or owns it)
 */
export async function canAccessCourse(courseId: string, userId?: string): Promise<boolean> {
  if (!userId) return false

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    })

    if (!user) return false

    // Admin can access all courses
    if (user.role === UserRole.ADMIN) return true

    // Check if user owns the course (instructor)
    const ownsCourse = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: user.id
      }
    })

    if (ownsCourse) return true

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId
        }
      }
    })

    return !!enrollment && enrollment.status === 'ACTIVE'
  } catch (error) {
    console.error('Error checking course access:', error)
    return false
  }
}

/**
 * Get user permissions based on role
 */
export function getUserPermissions(role: UserRole): {
  canCreateCourse: boolean
  canEditAllCourses: boolean
  canManageUsers: boolean
  canViewAnalytics: boolean
  canProcessPayments: boolean
  canModerateForum: boolean
  canIssueCertificates: boolean
} {
  const permissions = {
    canCreateCourse: false,
    canEditAllCourses: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canProcessPayments: false,
    canModerateForum: false,
    canIssueCertificates: false,
  }

  switch (role) {
    case UserRole.ADMIN:
      return {
        canCreateCourse: true,
        canEditAllCourses: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canProcessPayments: true,
        canModerateForum: true,
        canIssueCertificates: true,
      }
      
    case UserRole.INSTRUCTOR:
      return {
        ...permissions,
        canCreateCourse: true,
        canViewAnalytics: true,
        canModerateForum: true,
        canIssueCertificates: true,
      }
      
    default:
      return permissions
  }
}

/**
 * Sync user role with Clerk metadata
 */
export async function syncUserRole(clerkId: string, role: UserRole) {
  try {
    // Update in database
    await prisma.user.update({
      where: { clerkId },
      data: { role }
    })

    // You can also update Clerk metadata if needed
    // This requires the Clerk Backend API
    console.log(`User role updated to ${role} for user ${clerkId}`)
    
    return true
  } catch (error) {
    console.error('Error syncing user role:', error)
    return false
  }
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        firstName: true,
        lastName: true,
        skillLevel: true,
        learningGoals: true,
      }
    })

    if (!user) return false

    // Consider onboarding complete if basic profile is filled
    return !!(user.firstName && user.lastName && user.skillLevel && user.learningGoals.length > 0)
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return false
  }
}

/**
 * Get user dashboard URL based on role
 */
export function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin/dashboard'
    case UserRole.INSTRUCTOR:
      return '/instructor/dashboard'
    default:
      return '/student/dashboard'
  }
}

/**
 * Middleware helper for protecting API routes
 */
export async function protectApiRoute(requiredRole?: UserRole) {
  const { userId } = auth()
  
  if (!userId) {
    return { error: 'Unauthorized', status: 401 }
  }

  if (requiredRole) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!user || !hasRole(user.role, requiredRole)) {
      return { error: 'Insufficient permissions', status: 403 }
    }
  }

  return { userId, error: null, status: 200 }
}