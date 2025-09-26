'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  showHome?: boolean
  className?: string
}

export default function Breadcrumb({ 
  items = [], 
  showHome = true, 
  className = '' 
}: BreadcrumbProps) {
  const pathname = usePathname()
  
  // Auto-generate breadcrumbs from pathname if no items provided
  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbsFromPath(pathname)
  
  if (breadcrumbItems.length === 0) {
    return null
  }

  return (
    <nav 
      className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}
      aria-label="Breadcrumb"
    >
      {showHome && (
        <>
          <Link 
            href="/"
            className="flex items-center hover:text-red-600 transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbItems.length > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </>
      )}
      
      {breadcrumbItems.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          
          {item.href ? (
            <Link 
              href={item.href}
              className="flex items-center hover:text-red-600 transition-colors"
            >
              {item.icon && <item.icon className="h-4 w-4 mr-1" />}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center text-gray-900 font-medium">
              {item.icon && <item.icon className="h-4 w-4 mr-1" />}
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []
  
  // Build breadcrumbs from path segments
  let currentPath = ''
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`
    
    // Skip the last segment (current page) or add it without link
    const isLast = i === segments.length - 1
    
    breadcrumbs.push({
      label: formatSegmentLabel(segment),
      href: isLast ? undefined : currentPath
    })
  }
  
  return breadcrumbs
}

function formatSegmentLabel(segment: string): string {
  // Handle common LMS routes
  const labelMap: Record<string, string> = {
    'lms': 'LMS',
    'student': 'Student',
    'instructor': 'Instructor', 
    'admin': 'Admin',
    'dashboard': 'Dashboard',
    'courses': 'Courses',
    'create-course': 'Create Course',
    'progress': 'Progress',
    'certificates': 'Certificates',
    'messages': 'Messages',
    'students': 'Students',
    'analytics': 'Analytics',
    'earnings': 'Earnings',
    'users': 'Users',
    'payments': 'Payments',
    'settings': 'Settings',
  }
  
  if (labelMap[segment]) {
    return labelMap[segment]
  }
  
  // Handle dynamic segments (IDs, slugs)
  if (segment.match(/^[a-f0-9-]{36}$/) || segment.match(/^[a-f0-9]{24}$/)) {
    return 'Details' // Generic label for IDs
  }
  
  // Capitalize and format regular segments
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Predefined breadcrumb configurations for common LMS pages
export const BREADCRUMB_CONFIGS = {
  // Student routes
  '/student/dashboard': [
    { label: 'Student Portal', href: '/student' },
    { label: 'Dashboard' }
  ],
  '/student/courses': [
    { label: 'Student Portal', href: '/student' },
    { label: 'My Courses' }
  ],
  '/student/progress': [
    { label: 'Student Portal', href: '/student' },
    { label: 'Progress' }
  ],
  '/student/certificates': [
    { label: 'Student Portal', href: '/student' },
    { label: 'Certificates' }
  ],
  
  // Instructor routes
  '/instructor/dashboard': [
    { label: 'Instructor Portal', href: '/instructor' },
    { label: 'Dashboard' }
  ],
  '/instructor/courses': [
    { label: 'Instructor Portal', href: '/instructor' },
    { label: 'My Courses' }
  ],
  '/instructor/create-course': [
    { label: 'Instructor Portal', href: '/instructor' },
    { label: 'Create Course' }
  ],
  '/instructor/students': [
    { label: 'Instructor Portal', href: '/instructor' },
    { label: 'Students' }
  ],
  
  // Admin routes
  '/admin/dashboard': [
    { label: 'Admin Portal', href: '/admin' },
    { label: 'Dashboard' }
  ],
  '/admin/courses': [
    { label: 'Admin Portal', href: '/admin' },
    { label: 'All Courses' }
  ],
  '/admin/users': [
    { label: 'Admin Portal', href: '/admin' },
    { label: 'Users' }
  ],
}