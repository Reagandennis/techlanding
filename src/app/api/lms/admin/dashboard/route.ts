import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { hasPermission } from '@/lib/user-sync.server'

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { role: true }
    })

    if (!currentUser || !hasPermission(currentUser.role, UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get platform statistics
    const [
      totalUsers,
      totalCourses,
      activeUsers,
      totalEnrollments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.enrollment.count()
    ])

    // Calculate total revenue (mock calculation)
    const enrollments = await prisma.enrollment.findMany({
      include: { course: true },
      where: {
        paymentStatus: 'COMPLETED'
      }
    })
    
    const totalRevenue = enrollments.reduce((sum, enrollment) => {
      return sum + (enrollment.paymentAmount || enrollment.course.price || 0)
    }, 0)

    // Get recent users with their roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const stats = {
      totalUsers,
      totalCourses,
      totalRevenue: Math.round(totalRevenue),
      activeUsers
    }

    return NextResponse.json({
      stats,
      users,
      userRole: currentUser.role
    })

  } catch (error) {
    console.error('Error fetching admin dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
