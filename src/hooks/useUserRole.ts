import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserRole } from '@prisma/client'
import { canAccessLMSSection } from '@/lib/user-sync'

export function useUserRole() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Sync user with database and get role
      fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clerkId: user.id })
      })
      .then(res => res.json())
      .then(data => {
        setUserRole(data.role || UserRole.USER)
        setLoading(false)
      })
      .catch(() => {
        setUserRole(UserRole.USER)
        setLoading(false)
      })
    } else if (isLoaded) {
      setLoading(false)
    }
  }, [isLoaded, isSignedIn, user])

  return {
    userRole,
    loading,
    isSignedIn,
    canAccessStudent: userRole ? canAccessLMSSection(userRole, 'student') : false,
    canAccessInstructor: userRole ? canAccessLMSSection(userRole, 'instructor') : false,
    canAccessAdmin: userRole ? canAccessLMSSection(userRole, 'admin') : false,
  }
}
