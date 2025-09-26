import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { courseId, lessonId, progress = 0, timeSpent = 0, isCompleted = false } = body;

    if (!courseId || !lessonId) {
      return NextResponse.json(
        { error: 'Course ID and Lesson ID are required' },
        { status: 400 }
      );
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    });

    if (!enrollment) {
      // Check if lesson is free
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { isFree: true }
      });

      if (!lesson?.isFree) {
        return NextResponse.json(
          { error: 'Not enrolled in course' },
          { status: 403 }
        );
      }
    }

    // Update or create progress record
    const existingProgress = await prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lessonId
        }
      }
    });

    let progressRecord;
    if (existingProgress) {
      // Update existing progress
      progressRecord = await prisma.progress.update({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: lessonId
          }
        },
        data: {
          isCompleted: isCompleted || existingProgress.isCompleted,
          completedAt: isCompleted && !existingProgress.isCompleted ? new Date() : existingProgress.completedAt,
          timeSpent: Math.max(timeSpent, existingProgress.timeSpent || 0),
        }
      });
    } else {
      // Create new progress record
      progressRecord = await prisma.progress.create({
        data: {
          userId: user.id,
          lessonId: lessonId,
          courseId: courseId,
          isCompleted: isCompleted,
          completedAt: isCompleted ? new Date() : null,
          timeSpent: timeSpent,
        }
      });
    }

    // Calculate overall course progress
    const courseProgressData = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          select: { id: true }
        },
        progress: {
          where: {
            userId: user.id,
            isCompleted: true
          },
          select: { id: true }
        }
      }
    });

    let overallProgress = 0;
    if (courseProgressData) {
      const totalLessons = courseProgressData.lessons.length;
      const completedLessons = courseProgressData.progress.length;
      overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      // Update enrollment progress if enrolled
      if (enrollment) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            progress: overallProgress,
            completedAt: overallProgress >= 100 ? new Date() : null,
            status: overallProgress >= 100 ? 'COMPLETED' : 'ACTIVE'
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      progress: progressRecord,
      overallProgress: Math.round(overallProgress),
      message: isCompleted ? 'Lesson completed!' : 'Progress updated'
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get all progress for the course
    const progress = await prisma.progress.findMany({
      where: {
        userId: user.id,
        courseId: courseId
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            order: true,
            moduleId: true,
            module: {
              select: {
                id: true,
                title: true,
                order: true
              }
            }
          }
        }
      },
      orderBy: [
        {
          lesson: {
            module: {
              order: 'asc'
            }
          }
        },
        {
          lesson: {
            order: 'asc'
          }
        }
      ]
    });

    // Get enrollment info
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    });

    // Calculate overall progress
    const totalLessons = await prisma.lesson.count({
      where: { courseId: courseId }
    });

    const completedLessons = progress.filter(p => p.isCompleted).length;
    const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return NextResponse.json({
      progress: progress.map(p => ({
        lessonId: p.lessonId,
        isCompleted: p.isCompleted,
        completedAt: p.completedAt,
        timeSpent: p.timeSpent,
        lesson: p.lesson
      })),
      totalLessons,
      completedLessons,
      overallProgress: Math.round(overallProgress),
      isEnrolled: !!enrollment,
      enrollmentStatus: enrollment?.status || null
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}