import { UserRole } from '@prisma/client'

// Server-side functions moved to separate files
// Client-side utility functions only

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
