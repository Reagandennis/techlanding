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
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const lessonId = params.id;

    // Get user's progress for this lesson
    const progress = await prisma.progress.findFirst({
      where: {
        userId,
        lessonId
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            duration: true
          }
        }
      }
    });

    return NextResponse.json({ progress });

  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const lessonId = params.id;
    const body = await request.json();
    const { watchTime, isCompleted, lastAccessed } = body;

    // Verify the lesson exists and user is enrolled in the course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            enrollments: {
              where: {
                userId
              }
            }
          }
        }
      }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    if (lesson.course.enrollments.length === 0) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 403 }
      );
    }

    // Create or update progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      update: {
        watchTime: Math.max(watchTime || 0, 0), // Ensure non-negative
        isCompleted: isCompleted || false,
        lastAccessed: new Date(lastAccessed || new Date())
      },
      create: {
        userId,
        lessonId,
        watchTime: Math.max(watchTime || 0, 0),
        isCompleted: isCompleted || false,
        lastAccessed: new Date(lastAccessed || new Date())
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            duration: true
          }
        }
      }
    });

    // If lesson is completed, check if course should be marked as completed
    if (isCompleted) {
      await checkAndUpdateCourseCompletion(userId, lesson.course.id);
    }

    return NextResponse.json({ 
      progress,
      message: 'Progress updated successfully' 
    });

  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

async function checkAndUpdateCourseCompletion(userId: string, courseId: string) {
  try {
    // Get all lessons in the course
    const courseLessons = await prisma.lesson.findMany({
      where: {
        courseId,
        isPublished: true
      },
      select: { id: true }
    });

    // Get user's completed lessons for this course
    const completedLessons = await prisma.progress.findMany({
      where: {
        userId,
        isCompleted: true,
        lesson: {
          courseId
        }
      },
      select: { lessonId: true }
    });

    // Check if all lessons are completed
    const totalLessons = courseLessons.length;
    const completedCount = completedLessons.length;

    if (totalLessons > 0 && completedCount === totalLessons) {
      // Update enrollment to mark course as completed
      await prisma.enrollment.updateMany({
        where: {
          userId,
          courseId
        },
        data: {
          completedAt: new Date()
        }
      });

      // Create certificate if one doesn't exist
      const existingCertificate = await prisma.certificate.findFirst({
        where: {
          userId,
          courseId
        }
      });

      if (!existingCertificate) {
        await prisma.certificate.create({
          data: {
            userId,
            courseId,
            certificateNumber: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            issuedAt: new Date()
          }
        });
      }

      // Award completion badge if it doesn't exist
      const completionBadge = await prisma.badge.findFirst({
        where: {
          type: 'COURSE_COMPLETION',
          name: 'Course Completion'
        }
      });

      if (completionBadge) {
        const existingUserBadge = await prisma.userBadge.findFirst({
          where: {
            userId,
            badgeId: completionBadge.id
          }
        });

        if (!existingUserBadge) {
          await prisma.userBadge.create({
            data: {
              userId,
              badgeId: completionBadge.id,
              earnedAt: new Date(),
              metadata: {
                courseId,
                courseName: (await prisma.course.findUnique({ 
                  where: { id: courseId }, 
                  select: { title: true } 
                }))?.title
              }
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking course completion:', error);
  }
}
