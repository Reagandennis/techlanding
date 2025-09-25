'use client'

import { useUserRole } from '@/hooks/useUserRole.simple'
import { Shield, User, UserCheck, Crown } from 'lucide-react'

export default function UserAccessBadge() {
  const { userRole, loading, canAccessStudent, canAccessInstructor, canAccessAdmin } = useUserRole()

  if (loading) {
    return (
      <div className="flex items-center px-2 py-1 bg-gray-100 rounded-full">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-1"></div>
        <span className="text-xs text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!userRole) return null

  const getRoleIcon = () => {
    if (canAccessAdmin) return <Crown className="h-3 w-3" />
    if (canAccessInstructor) return <UserCheck className="h-3 w-3" />
    if (canAccessStudent) return <User className="h-3 w-3" />
    return <Shield className="h-3 w-3" />
  }

  const getRoleColor = () => {
    if (canAccessAdmin) return "bg-purple-100 text-purple-700 border-purple-200"
    if (canAccessInstructor) return "bg-green-100 text-green-700 border-green-200"
    if (canAccessStudent) return "bg-blue-100 text-blue-700 border-blue-200"
    return "bg-gray-100 text-gray-700 border-gray-200"
  }

  const getAccessLevel = () => {
    const levels = []
    if (canAccessAdmin) levels.push('Admin')
    if (canAccessInstructor) levels.push('Instructor')
    if (canAccessStudent) levels.push('Student')
    return levels.length > 0 ? levels.join(' + ') : 'Basic'
  }

  return (
    <div className={`flex items-center px-2 py-1 rounded-full border text-xs font-medium ${getRoleColor()}`}>
      {getRoleIcon()}
      <span className="ml-1">{getAccessLevel()}</span>
    </div>
  )
}