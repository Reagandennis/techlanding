import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'
import { protectApiRoute } from '@/lib/auth'

export async function GET() {
  const authCheck = await protectApiRoute()
  
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }

  try {
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: authCheck.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get enrollment statistics
    const [enrollments, completedEnrollments, analytics, certificates] = await Promise.all([
      prisma.enrollment.findMany({
        where: { 
          userId: user.id,
          status: { in: ['ACTIVE', 'COMPLETED'] }
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              _count: {
                select: {
                  lessons: {
                    where: { isPublished: true }
                  }
                }
              }
            }
          }
        }
      }),
      prisma.enrollment.count({
        where: { 
          userId: user.id,
          status: 'COMPLETED'
        }
      }),
      prisma.userAnalytics.findFirst({
        where: { userId: user.id },
        orderBy: { date: 'desc' }
      }),
      prisma.certificate.count({
        where: { userId: user.id }
      })
    ])

    // Calculate progress for each enrollment
    let totalWatchTime = 0
    let averageProgress = 0
    
    if (enrollments.length > 0) {
      const progressPromises = enrollments.map(async (enrollment) => {
        const [completedLessons, totalLessons] = await Promise.all([
          prisma.progress.count({
            where: {
              userId: user.id,
              courseId: enrollment.courseId,
              isCompleted: true
            }
          }),
          prisma.lesson.count({
            where: {
              courseId: enrollment.courseId,
              isPublished: true
            }
          })
        ])

        const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
        return progress
      })

      const allProgress = await Promise.all(progressPromises)
      averageProgress = allProgress.reduce((sum, progress) => sum + progress, 0) / allProgress.length
    }

    // Get watch time from analytics or calculate from progress
    if (analytics) {
      totalWatchTime = analytics.totalWatchTime || 0
    } else {
      // Calculate estimated watch time based on completed lessons
      const completedProgressCount = await prisma.progress.count({
        where: {
          userId: user.id,
          isCompleted: true
        }
      })
      // Estimate 10 minutes per completed lesson
      totalWatchTime = completedProgressCount * 10
    }

    const inProgressCourses = enrollments.length - completedEnrollments

    const stats = {
      totalCourses: enrollments.length,
      completedCourses: completedEnrollments,
      inProgressCourses,
      totalWatchTime,
      certificatesEarned: certificates,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      totalPoints: user.totalPoints || 0,
      averageProgress: Math.round(averageProgress)
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching student stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student statistics' },
      { status: 500 }
    )
  }
}