'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { UserRole } from '@prisma/client'
import { 
  BookOpen, 
  Users, 
  Settings, 
  BarChart3, 
  GraduationCap,
  Menu,
  X,
  Home,
  User,
  FileText,
  Award
} from 'lucide-react'
import { canAccessLMSSection } from '@/lib/user-sync'

interface LMSLayoutProps {
  children: React.ReactNode
  currentSection: 'student' | 'instructor' | 'admin'
  userRole: UserRole
}

export default function LMSLayout({ children, currentSection, userRole }: LMSLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navigation = [
    // Student Navigation
    ...(canAccessLMSSection(userRole, 'student') ? [
      {
        name: 'Student Dashboard',
        href: '/lms/student',
        icon: Home,
        section: 'student' as const
      },
      {
        name: 'My Courses',
        href: '/lms/student/courses',
        icon: BookOpen,
        section: 'student' as const
      },
      {
        name: 'My Progress',
        href: '/lms/student/progress',
        icon: BarChart3,
        section: 'student' as const
      },
      {
        name: 'Certificates',
        href: '/lms/student/certificates',
        icon: Award,
        section: 'student' as const
      }
    ] : []),
    
    // Instructor Navigation
    ...(canAccessLMSSection(userRole, 'instructor') ? [
      {
        name: 'Instructor Dashboard',
        href: '/lms/instructor',
        icon: GraduationCap,
        section: 'instructor' as const
      },
      {
        name: 'My Courses',
        href: '/lms/instructor/courses',
        icon: BookOpen,
        section: 'instructor' as const
      },
      {
        name: 'Students',
        href: '/lms/instructor/students',
        icon: Users,
        section: 'instructor' as const
      },
      {
        name: 'Analytics',
        href: '/lms/instructor/analytics',
        icon: BarChart3,
        section: 'instructor' as const
      }
    ] : []),
    
    // Admin Navigation
    ...(canAccessLMSSection(userRole, 'admin') ? [
      {
        name: 'Admin Dashboard',
        href: '/lms/admin',
        icon: Settings,
        section: 'admin' as const
      },
      {
        name: 'User Management',
        href: '/lms/admin/users',
        icon: Users,
        section: 'admin' as const
      },
      {
        name: 'Course Management',
        href: '/lms/admin/courses',
        icon: BookOpen,
        section: 'admin' as const
      },
      {
        name: 'Reports',
        href: '/lms/admin/reports',
        icon: FileText,
        section: 'admin' as const
      }
    ] : [])
  ]

  const currentNavigation = navigation.filter(item => 
    item.section === currentSection || 
    (userRole === UserRole.ADMIN && (item.section === 'student' || item.section === 'instructor'))
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-white p-2 rounded-md shadow-lg"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/" className="text-xl font-bold text-red-600">
              TechGet<span className="text-black">Africa</span>
            </Link>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} LMS
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {currentNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Link
              href="/"
              className="flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 rounded-md transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Home className="h-5 w-5 mr-3" />
              Back to Main Site
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
