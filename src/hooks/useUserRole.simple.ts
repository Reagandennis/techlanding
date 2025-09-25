import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserRole } from '@prisma/client'

export function useUserRole() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // For testing: Give all signed-in users student access by default
      // In production, this should fetch from your API
      setUserRole(UserRole.STUDENT)
      setLoading(false)
    } else if (isLoaded) {
      setLoading(false)
    }
  }, [isLoaded, isSignedIn, user])

  // Simplified permissions - for testing
  const getPermissions = (role: UserRole | null) => {
    if (!role) return { student: false, instructor: false, admin: false }
    
    switch (role) {
      case UserRole.ADMIN:
        return { student: true, instructor: true, admin: true }
      case UserRole.INSTRUCTOR:
        return { student: true, instructor: true, admin: false }
      case UserRole.STUDENT:
        return { student: true, instructor: false, admin: false }
      default:
        return { student: false, instructor: false, admin: false }
    }
  }

  const permissions = getPermissions(userRole)

  return {
    userRole,
    loading,
    isSignedIn,
    canAccessStudent: permissions.student,
    canAccessInstructor: permissions.instructor,
    canAccessAdmin: permissions.admin,
  }
}