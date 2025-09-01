'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserRole } from '@prisma/client'
import { canAccessLMSSection } from '@/lib/user-sync'
import { AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface LMSProtectedRouteProps {
  children: React.ReactNode
  requiredSection: 'student' | 'instructor' | 'admin'
  fallbackRole?: UserRole
}

export default function LMSProtectedRoute({ 
  children, 
  requiredSection,
  fallbackRole = UserRole.USER 
}: LMSProtectedRouteProps) {
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
        setUserRole(data.role || fallbackRole)
        setLoading(false)
      })
      .catch(() => {
        setUserRole(fallbackRole)
        setLoading(false)
      })
    } else if (isLoaded && !isSignedIn) {
      setLoading(false)
    }
  }, [isLoaded, isSignedIn, user, fallbackRole])

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to sign in to access the LMS {requiredSection} section.
          </p>
          <Link
            href="/sign-in"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  // No access to this section
  if (userRole && !canAccessLMSSection(userRole, requiredSection)) {
    const availableSections = []
    if (canAccessLMSSection(userRole, 'student')) availableSections.push('student')
    if (canAccessLMSSection(userRole, 'instructor')) availableSections.push('instructor')
    if (canAccessLMSSection(userRole, 'admin')) availableSections.push('admin')

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the {requiredSection} section of the LMS.
          </p>
          
          {availableSections.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-3">You can access:</p>
              {availableSections.map(section => (
                <Link
                  key={section}
                  href={`/lms/${section}`}
                  className="block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)} LMS
                </Link>
              ))}
            </div>
          )}
          
          <Link
            href="/"
            className="block mt-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            Back to Main Site
          </Link>
        </div>
      </div>
    )
  }

  // User has access, render children
  return <>{children}</>
}
