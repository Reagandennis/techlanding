import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'
import { protectApiRoute, getCurrentUser, canAccessCourse } from '@/lib/auth'
import { UserRole, CourseStatus } from '@prisma/client'
import { z } from 'zod'

const UpdateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  shortDescription: z.string().max(500).optional(),
  thumbnail: z.string().url().optional(),
  trailerVideo: z.string().url().optional(),
  price: z.number().min(0).optional(),
  discountPrice: z.number().min(0).optional(),
  currency: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']).optional(),
  duration: z.number().positive().optional(),
  language: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  status: z.nativeEnum(CourseStatus).optional(),
})

// GET /api/courses/[courseId] - Get individual course
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth()
    const { courseId } = params

    // Check if user can access this course
    const hasAccess = userId ? await canAccessCourse(courseId, userId) : false

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            bio: true,
            linkedinUrl: true,
            twitterUrl: true,
          }
        },
        modules: {
          include: {
            lessons: {
              where: {
                isPublished: true
              },
              include: userId ? {
                progress: {
                  where: { 
                    user: { clerkId: userId }
                  }
                }
              } : false,
              orderBy: { order: 'asc' }
            },
            quizzes: {
              where: { isPublished: true }
            },
            assignments: true
          },
          orderBy: { order: 'asc' }
        },
        categories: {
          include: { category: true }
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
            modules: true,
            lessons: true,
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if course is published or user has access
    if (!course.published && !hasAccess) {
      return NextResponse.json({ error: 'Course not available' }, { status: 403 })
    }

    // Get enrollment info if user is authenticated
    let enrollment = null
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId }
      })
      
      if (user) {
        enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: course.id
            }
          }
        })
      }
    }

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { courseId: course.id, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true }
    })

    // Calculate progress if enrolled
    let progressData = null
    if (enrollment) {
      const totalLessons = await prisma.lesson.count({
        where: { courseId: course.id, isPublished: true }
      })
      
      const completedLessons = await prisma.progress.count({
        where: { 
          courseId: course.id,
          user: { clerkId: userId },
          isCompleted: true
        }
      })
      
      progressData = {
        totalLessons,
        completedLessons,
        percentage: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
      }
    }

    const response = {
      ...course,
      avgRating: avgRating._avg.rating || 0,
      ratingCount: avgRating._count.rating || 0,
      isEnrolled: !!enrollment,
      enrollment: enrollment ? {
        id: enrollment.id,
        status: enrollment.status,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        paymentStatus: enrollment.paymentStatus
      } : null,
      progressData,
      hasAccess
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    )
  }
}

// PUT /api/courses/[courseId] - Update course (instructor/admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const authCheck = await protectApiRoute(UserRole.INSTRUCTOR)
  
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }

  try {
    const { courseId } = params
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user owns the course or is admin
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true }
    })

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (existingCourse.instructorId !== user.id && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const data = await request.json()
    const validatedData = UpdateCourseSchema.parse(data)

    // Generate new slug if title is being updated
    let updateData: any = { ...validatedData }
    if (validatedData.title) {
      const slug = generateSlug(validatedData.title)
      
      // Check if new slug conflicts with existing course
      const slugConflict = await prisma.course.findFirst({
        where: { 
          slug, 
          id: { not: courseId }
        }
      })
      
      if (slugConflict) {
        return NextResponse.json(
          { error: 'A course with this title already exists' },
          { status: 409 }
        )
      }
      
      updateData.slug = slug
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        categories: {
          include: { category: true }
        },
        _count: {
          select: {
            modules: true,
            lessons: true,
            enrollments: true,
          }
        }
      }
    })

    return NextResponse.json(updatedCourse)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[courseId] - Delete course (instructor/admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const authCheck = await protectApiRoute(UserRole.INSTRUCTOR)
  
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }

  try {
    const { courseId } = params
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user owns the course or is admin
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: { 
        instructorId: true,
        title: true,
        _count: { select: { enrollments: true } }
      }
    })

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (existingCourse.instructorId !== user.id && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if course has enrollments
    if (existingCourse._count.enrollments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with active enrollments. Archive it instead.' },
        { status: 409 }
      )
    }

    // Soft delete by updating status and setting deletedAt
    await prisma.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.ARCHIVED,
        published: false,
        deletedAt: new Date()
      }
    })

    return NextResponse.json({ message: 'Course deleted successfully' })

  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}