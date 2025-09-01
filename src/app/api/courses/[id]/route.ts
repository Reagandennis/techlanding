import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    const courseId = params.id;

    // Fetch course with all related data
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        isPublished: true
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true
          }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        },
        lessons: {
          where: {
            isPublished: true
          },
          orderBy: {
            position: 'asc'
          },
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            position: true,
            videoUrl: true,
            isFree: true,
            isPublished: true
          }
        },
        _count: {
          select: {
            lessons: {
              where: {
                isPublished: true
              }
            },
            enrollments: true,
            reviews: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is enrolled and get progress if authenticated
    let isEnrolled = false;
    let canAccess = false;
    let paymentStatus = null;
    let userProgress = null;

    if (userId) {
      // Check enrollment status
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        },
        include: {
          progress: {
            include: {
              lesson: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        }
      });

      if (enrollment) {
        isEnrolled = true;
        paymentStatus = enrollment.paymentStatus;
        canAccess = enrollment.paymentStatus === 'completed' || course.price === 0;

        // Calculate progress
        if (enrollment.progress.length > 0) {
          const completedLessons = enrollment.progress.filter(p => p.isCompleted).length;
          const totalLessons = course.lessons.length;
          const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
          
          // Get last accessed lesson
          const lastProgress = enrollment.progress
            .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())[0];

          userProgress = {
            completedLessons,
            progressPercent,
            lastAccessedLesson: lastProgress?.lesson
          };
        }
      }
    }

    // Calculate average rating (placeholder - you'd implement actual rating system)
    const averageRating = 4.5; // This would come from actual reviews

    const courseData = {
      ...course,
      isEnrolled,
      canAccess,
      paymentStatus,
      userProgress,
      averageRating
    };

    return NextResponse.json({ course: courseData });

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = params.id;
    const body = await request.json();

    // Check if user is the instructor or admin
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });

    if (!user || (course.instructorId !== user.id && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to edit this course' },
        { status: 403 }
      );
    }

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...body,
        updatedAt: new Date()
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true
          }
        }
      }
    });

    return NextResponse.json({ course: updatedCourse });

  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courseId = params.id;

    // Check if user is admin (only admins can delete courses)
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only administrators can delete courses' },
        { status: 403 }
      );
    }

    // Soft delete - mark as unpublished instead of actual deletion
    const deletedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        isPublished: false,
        deletedAt: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Course deleted successfully',
      course: deletedCourse 
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
