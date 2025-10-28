'use client'

import { UserRole } from '@/types/supabase'

interface LMSLayoutProps {
  children: React.ReactNode
  userRole?: UserRole
  currentSection: 'student' | 'instructor' | 'admin'
}

export default function LMSLayout({ children, userRole, currentSection }: LMSLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
