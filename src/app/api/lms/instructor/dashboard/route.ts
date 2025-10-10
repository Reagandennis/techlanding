import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has instructor role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'INSTRUCTOR' && profile.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // For now, return mock data since we're transitioning from Prisma to Supabase
    // You would need to implement actual course queries based on your Supabase schema

    // Mock data for instructor dashboard
    // This should be replaced with actual Supabase queries when course tables are set up
    const totalCourses = 0
    const totalStudents = 0
    const totalRevenue = 0
    const avgRating = 0

    const formattedCourses: any[] = []

    const stats = {
      totalCourses,
      totalStudents,
      totalRevenue: Math.round(totalRevenue),
      avgRating
    }

    return NextResponse.json({
      stats,
      courses: formattedCourses,
      userRole: profile.role
    })

  } catch (error) {
    console.error('Error fetching instructor dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
