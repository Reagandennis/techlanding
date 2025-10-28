import { NextRequest } from 'next/server'
import { withAuth, ApiResponse } from '@/lib/supabase-auth'

// GET /api/auth/user - Get current user profile
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    return ApiResponse.success({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return ApiResponse.internal('Failed to fetch user profile')
  }
})

// PUT /api/auth/user - Update user profile
export const PUT = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json()
    const { createServerSupabaseClient } = await import('@/lib/supabase/server')
    const supabase = await createServerSupabaseClient()

    // Validate input
    const allowedFields = [
      'name', 'first_name', 'last_name', 'phone', 'bio', 'avatar_url',
      'timezone', 'language', 'linkedin_url', 'twitter_url', 'github_url',
      'website_url', 'email_notifications', 'push_notifications', 'marketing_emails'
    ]

    const updates: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return ApiResponse.validation('No valid fields to update')
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return ApiResponse.internal('Failed to update profile')
    }

    return ApiResponse.success({ profile: data })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return ApiResponse.internal('Failed to update profile')
  }
})