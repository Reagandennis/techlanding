import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;

    // Get course with modules and lessons
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user can access the course
    let userProgress: any = {};
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true }
      });

      if (user) {
        // Get enrollment info
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: courseId
            }
          }
        });

        // Get progress
        const progress = await prisma.progress.findMany({
          where: {
            userId: user.id,
            courseId: courseId
          }
        });

        userProgress = {
          isEnrolled: !!enrollment,
          completedLessons: progress.filter(p => p.isCompleted).map(p => p.lessonId),
          overallProgress: enrollment?.progress || 0
        };
      }
    }

    return NextResponse.json({
      ...course,
      userProgress
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}