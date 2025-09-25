'use client'

import { useUser } from '@clerk/nextjs'
import { useUserRole } from '@/hooks/useUserRole.simple'

export default function DebugAuth() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { userRole, loading, canAccessStudent, canAccessInstructor, canAccessAdmin } = useUserRole()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed top-20 right-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-sm">
      <h3 className="font-bold mb-2">Debug Auth State:</h3>
      <div className="space-y-1">
        <div>Clerk Loaded: {isLoaded ? '✅' : '❌'}</div>
        <div>Signed In: {isSignedIn ? '✅' : '❌'}</div>
        <div>User ID: {user?.id || 'None'}</div>
        <div>Role Loading: {loading ? '⏳' : '✅'}</div>
        <div>User Role: {userRole || 'None'}</div>
        <div>Can Access Student: {canAccessStudent ? '✅' : '❌'}</div>
        <div>Can Access Instructor: {canAccessInstructor ? '✅' : '❌'}</div>
        <div>Can Access Admin: {canAccessAdmin ? '✅' : '❌'}</div>
        <div>Should Show LMS: {isSignedIn && !loading && (canAccessStudent || canAccessInstructor || canAccessAdmin) ? '✅' : '❌'}</div>
      </div>
    </div>
  )
}