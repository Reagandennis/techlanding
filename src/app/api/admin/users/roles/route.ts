import { NextRequest } from 'next/server'
import { withRole, ApiResponse } from '@/lib/supabase-auth'

// PUT /api/admin/users/roles - Update user role (Admin only)
export const PUT = withRole(['ADMIN'], async (req: NextRequest, user) => {
  try {
    const body = await req.json()
    const { userId, role } = body

    if (!userId || !role) {
      return ApiResponse.validation('User ID and role are required')
    }

    if (!['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(role)) {
      return ApiResponse.validation('Invalid role')
    }

    // Prevent users from changing their own role
    if (userId === user.id) {
      return ApiResponse.forbidden('Cannot change your own role')
    }

    const { createServerSupabaseClient } = await import('@/lib/supabase/server')
    const supabase = await createServerSupabaseClient()

    // Check if target user exists
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (!targetUser) {
      return ApiResponse.notFound('User not found')
    }

    // Update user role
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user role:', error)
      return ApiResponse.internal('Failed to update user role')
    }

    return ApiResponse.success({
      message: 'User role updated successfully',
      user: data
    })
  } catch (error) {
    console.error('Error in role update API:', error)
    return ApiResponse.internal('Failed to update user role')
  }
})