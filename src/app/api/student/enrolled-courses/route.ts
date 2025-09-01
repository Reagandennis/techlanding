import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      return NextResponse.json({ courses: [] });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: dbUser.id,
        status: 'ACTIVE'
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            lessons: {
              where: {
                isPublished: true
              },
              select: {
                id: true,
                title: true,
                order: true,
                type: true
              },
              orderBy: {
                order: 'asc'
              }
            },
            _count: {
              select: {
                lessons: {
                  where: {
                    isPublished: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    });

    // Calculate progress for each course
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const totalLessons = enrollment.course._count.lessons;
        const completedLessons = await prisma.progress.count({
          where: {
            userId: dbUser.id,
            lesson: {
              courseId: enrollment.course.id
            },
            isCompleted: true
          }
        });

        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          thumbnail: enrollment.course.thumbnail,
          instructor: enrollment.course.instructor,
          progress,
          enrolledAt: enrollment.enrolledAt,
          paymentStatus: enrollment.paymentStatus,
          canAccess: enrollment.paymentStatus === 'PAID' || enrollment.course.price === 0,
          _count: {
            lessons: totalLessons
          },
          lessons: enrollment.course.lessons
        };
      })
    );

    return NextResponse.json({ 
      courses: coursesWithProgress,
      total: coursesWithProgress.length 
    });
    
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
