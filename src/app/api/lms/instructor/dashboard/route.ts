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

    if (!dbUser || !canAccessLMSSection(dbUser.role, 'instructor')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get instructor's courses
    const courses = await prisma.course.findMany({
      where: { instructorId: dbUser.id },
      include: {
        enrollments: true,
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate statistics
    const totalCourses = courses.length
    const totalStudents = courses.reduce((sum, course) => sum + course._count.enrollments, 0)
    
    // Calculate revenue
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          instructorId: dbUser.id
        },
        paymentStatus: 'COMPLETED'
      },
      include: { course: true }
    })
    
    const totalRevenue = enrollments.reduce((sum, enrollment) => {
      return sum + (enrollment.paymentAmount || enrollment.course.price || 0)
    }, 0)

    // Mock average rating (would normally be calculated from reviews)
    const avgRating = 4.5

    // Format courses for display
    const formattedCourses = courses.slice(0, 5).map(course => ({
      id: course.id,
      title: course.title,
      thumbnail: course.thumbnail,
      status: course.status,
      enrollments: course._count.enrollments,
      price: course.price
    }))

    const stats = {
      totalCourses,
      totalStudents,
      totalRevenue: Math.round(totalRevenue),
      avgRating
    }

    return NextResponse.json({
      stats,
      courses: formattedCourses,
      userRole: dbUser.role
    })

  } catch (error) {
    console.error('Error fetching instructor dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
