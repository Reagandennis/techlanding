import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { canAccessLMSSection } from '@/lib/user-sync.server'

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Sync and get user
    const dbUser = await prisma.user.findUnique({
      where: { clerkId }
    })

    if (!dbUser || !canAccessLMSSection(dbUser.role, 'student')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get student statistics
    const [
      enrollments,
      completedEnrollments,
      certificates
    ] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: dbUser.id },
        include: {
          course: {
            include: {
              instructor: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { enrolledAt: 'desc' }
      }),
      prisma.enrollment.count({
        where: {
          userId: dbUser.id,
          status: 'COMPLETED'
        }
      }),
      prisma.certificate.count({
        where: { userId: dbUser.id }
      })
    ])

    // Calculate average progress
    const totalProgress = enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0)
    const avgProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0

    // Format recent courses
    const recentCourses = enrollments.slice(0, 5).map(enrollment => ({
      id: enrollment.course.id,
      title: enrollment.course.title,
      thumbnail: enrollment.course.thumbnail,
      instructor: enrollment.course.instructor.name,
      progress: Math.round(enrollment.progress),
      status: enrollment.status
    }))

    const stats = {
      enrolledCourses: enrollments.length,
      completedCourses: completedEnrollments,
      totalProgress: avgProgress,
      certificates
    }

    return NextResponse.json({
      stats,
      recentCourses,
      userRole: dbUser.role
    })

  } catch (error) {
    console.error('Error fetching student dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
