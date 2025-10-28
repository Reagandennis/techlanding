import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId } = params;

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

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      },
      select: {
        id: true,
        status: true,
        progress: true,
        enrolledAt: true,
        completedAt: true
      }
    });

    // Get progress data
    const progressData = await prisma.progress.findMany({
      where: {
        userId: user.id,
        courseId: courseId
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            order: true
          }
        }
      },
      orderBy: {
        lesson: {
          order: 'asc'
        }
      }
    });

    const completedLessons = progressData
      .filter(p => p.isCompleted)
      .map(p => p.lessonId);

    // Get current lesson (last accessed or first incomplete)
    const lastAccessedProgress = progressData
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
    
    let currentLesson = '';
    if (lastAccessedProgress) {
      currentLesson = lastAccessedProgress.lessonId;
    } else if (progressData.length > 0) {
      // Find first incomplete lesson
      const firstIncomplete = progressData.find(p => !p.isCompleted);
      currentLesson = firstIncomplete?.lessonId || progressData[0].lessonId;
    }

    return NextResponse.json({
      isEnrolled: !!enrollment,
      enrollmentStatus: enrollment?.status || null,
      enrolledAt: enrollment?.enrolledAt || null,
      completedAt: enrollment?.completedAt || null,
      progress: enrollment?.progress || 0,
      completedLessons,
      currentLesson,
      totalLessonsProgress: progressData.length,
      progressData: progressData.map(p => ({
        lessonId: p.lessonId,
        isCompleted: p.isCompleted,
        completedAt: p.completedAt,
        timeSpent: p.timeSpent,
        lastAccessed: p.updatedAt,
        lesson: p.lesson
      }))
    });

  } catch (error) {
    console.error('Error checking enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to check enrollment' },
      { status: 500 }
    );
  }
}