import { NextRequest, NextResponse } from 'next/server'
import { protectApiRoute, getCurrentUser, canAccessCourse } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const CreateModuleSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  order: z.number().int().positive(),
  prerequisites: z.array(z.string()).default([]),
})

const UpdateModuleSchema = CreateModuleSchema.partial()

// GET /api/courses/[courseId]/modules - List course modules
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params
    const { userId } = await protectApiRoute()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user can access this course
    const hasAccess = await canAccessCourse(courseId, userId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          include: {
            progress: userId ? {
              where: {
                user: { clerkId: userId }
              }
            } : false,
            videoFile: {
              select: {
                duration: true,
                processingStatus: true,
                thumbnailPath: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        quizzes: {
          include: {
            attempts: userId ? {
              where: {
                user: { clerkId: userId }
              },
              orderBy: { createdAt: 'desc' },
              take: 1
            } : false
          },
          orderBy: { title: 'asc' }
        },
        assignments: {
          include: {
            submissions: userId ? {
              where: {
                user: { clerkId: userId }
              }
            } : false
          },
          orderBy: { title: 'asc' }
        },
        _count: {
          select: {
            lessons: true,
            quizzes: true,
            assignments: true
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    // Add progress information for each module
    const modulesWithProgress = modules.map(module => {
      const totalItems = module.lessons.length + module.quizzes.length + module.assignments.length
      let completedItems = 0

      // Count completed lessons
      completedItems += module.lessons.filter(lesson => 
        lesson.progress?.[0]?.isCompleted
      ).length

      // Count completed quizzes
      completedItems += module.quizzes.filter(quiz => 
        quiz.attempts?.[0]?.isPassed
      ).length

      // Count completed assignments
      completedItems += module.assignments.filter(assignment => 
        assignment.submissions?.[0]?.status === 'GRADED' && 
        (assignment.submissions[0].score || 0) >= (assignment.submissions[0].maxScore || 100) * 0.6 // 60% pass rate
      ).length

      const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

      return {
        ...module,
        progressPercentage,
        isCompleted: progressPercentage === 100,
        totalItems,
        completedItems
      }
    })

    return NextResponse.json(modulesWithProgress)

  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    )
  }
}

// POST /api/courses/[courseId]/modules - Create new module
export async function POST(
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

    // Verify user owns the course or is admin
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (course.instructorId !== user.id && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const data = await request.json()
    const validatedData = CreateModuleSchema.parse(data)

    // Check for order conflicts
    const existingModule = await prisma.module.findFirst({
      where: {
        courseId,
        order: validatedData.order
      }
    })

    if (existingModule) {
      return NextResponse.json(
        { error: 'A module with this order already exists' },
        { status: 409 }
      )
    }

    const module = await prisma.module.create({
      data: {
        ...validatedData,
        courseId
      },
      include: {
        _count: {
          select: {
            lessons: true,
            quizzes: true,
            assignments: true
          }
        }
      }
    })

    return NextResponse.json(module, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating module:', error)
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    )
  }
}