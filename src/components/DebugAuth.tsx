'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function DebugAuth() {
  const { user, loading, isAdmin, isInstructor, isStudent } = useAuth()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed top-20 right-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-sm">
      <h3 className="font-bold mb-2">Debug Auth State (Supabase):</h3>
      <div className="space-y-1">
        <div>Auth Loading: {loading ? '⏳' : '✅'}</div>
        <div>Signed In: {user ? '✅' : '❌'}</div>
        <div>User ID: {user?.id || 'None'}</div>
        <div>Email: {user?.email || 'None'}</div>
        <div>User Role: {user?.role || 'None'}</div>
        <div>Is Student: {isStudent() ? '✅' : '❌'}</div>
        <div>Is Instructor: {isInstructor() ? '✅' : '❌'}</div>
        <div>Is Admin: {isAdmin() ? '✅' : '❌'}</div>
        <div>Should Show LMS: {user && !loading ? '✅' : '❌'}</div>
      </div>
    </div>
  )
}
