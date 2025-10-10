import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole, Profile } from '@/types/supabase'

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
  profile: Profile
}

/**
 * Get the authenticated user from the server-side request
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email || '',
      role: profile.role,
      profile
    }
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

/**
 * Middleware wrapper to protect API routes with authentication
 */
export function withAuth(
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const user = await getAuthenticatedUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return handler(req, user)
  }
}

/**
 * Middleware wrapper to protect API routes with role-based authorization
 */
export function withRole(
  requiredRoles: UserRole | UserRole[],
  handler: (req: NextRequest, user: AuthenticatedUser) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const user = await getAuthenticatedUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    
    if (!roles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return handler(req, user)
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(user: AuthenticatedUser, role: UserRole | UserRole[]): boolean {
  if (Array.isArray(role)) {
    return role.includes(user.role)
  }
  return user.role === role
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthenticatedUser): boolean {
  return user.role === 'ADMIN'
}

/**
 * Check if user is instructor or admin
 */
export function isInstructor(user: AuthenticatedUser): boolean {
  return hasRole(user, ['INSTRUCTOR', 'ADMIN'])
}

/**
 * Check if user can manage another user
 */
export async function canManageUser(managerId: string, targetUserId: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: managerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', managerId)
      .single()
    
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', targetUserId)
      .single()

    if (!managerProfile || !targetProfile) {
      return false
    }

    // Admins can manage anyone
    if (managerProfile.role === 'ADMIN') {
      return true
    }

    // Instructors can only manage students
    if (managerProfile.role === 'INSTRUCTOR' && targetProfile.role === 'STUDENT') {
      return true
    }

    // Users can only manage themselves
    if (managerId === targetUserId) {
      return true
    }

    return false
  } catch (error) {
    console.error('Error checking user management permissions:', error)
    return false
  }
}

/**
 * Check if user can access course
 */
export async function canAccessCourse(userId: string, courseId: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: user } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!user) {
      return false
    }

    // Admins can access any course
    if (user.role === 'ADMIN') {
      return true
    }

    const { data: course } = await supabase
      .from('courses')
      .select('instructor_id, published')
      .eq('id', courseId)
      .single()

    if (!course) {
      return false
    }

    // Instructors can access their own courses
    if (course.instructor_id === userId) {
      return true
    }

    // Students can access published courses they're enrolled in
    if (user.role === 'STUDENT' && course.published) {
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single()

      return !!enrollment
    }

    return false
  } catch (error) {
    console.error('Error checking course access:', error)
    return false
  }
}

/**
 * Create a protected API route response helper
 */
export class ApiResponse {
  static success(data: any, status: number = 200) {
    return NextResponse.json({ success: true, data }, { status })
  }

  static error(message: string, status: number = 400, code?: string) {
    return NextResponse.json(
      { success: false, error: message, code },
      { status }
    )
  }

  static unauthorized(message: string = 'Authentication required') {
    return this.error(message, 401, 'UNAUTHORIZED')
  }

  static forbidden(message: string = 'Insufficient permissions') {
    return this.error(message, 403, 'FORBIDDEN')
  }

  static notFound(message: string = 'Resource not found') {
    return this.error(message, 404, 'NOT_FOUND')
  }

  static validation(message: string = 'Invalid input') {
    return this.error(message, 422, 'VALIDATION_ERROR')
  }

  static internal(message: string = 'Internal server error') {
    return this.error(message, 500, 'INTERNAL_ERROR')
  }
}