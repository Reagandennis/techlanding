import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { StudentProgress } from '@/types/analytics';
import { subDays, subWeeks, subMonths } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30days';
    const courseId = searchParams.get('courseId');

    // Check permissions - user can see their own data, instructors can see their students, admins see all
    const canAccess = session.user.id === userId || 
                      session.user.role === 'admin' || 
                      (session.user.role === 'instructor' && courseId);

    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (timeRange) {
      case '7days':
        startDate = subDays(now, 7);
        break;
      case '30days':
        startDate = subDays(now, 30);
        break;
      case '90days':
        startDate = subDays(now, 90);
        break;
      default:
        startDate = subDays(now, 30);
    }

    // Build where clause
    const whereClause: any = {
      userId: userId,
      updatedAt: {
        gte: startDate
      }
    };

    if (courseId) {
      whereClause.courseId = courseId;
    }

    // Fetch enrollments and related data
    const enrollments = await prisma.enrollment.findMany({
      where: whereClause,
      include: {
        course: {
          include: {
            lessons: true,
            quizzes: true
          }
        },
        progress: {
          include: {
            lesson: true
          }
        }
      }
    });

    // Calculate progress for each course
    const studentProgress: StudentProgress[] = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.course;
        const totalLessons = course.lessons.length;
        const completedLessons = enrollment.progress.filter(p => p.completed).length;
        
        // Get quiz attempts for this user and course
        const quizAttempts = await prisma.quizAttempt.findMany({
          where: {
            userId: userId,
            quiz: {
              courseId: course.id
            }
          },
          include: {
            quiz: true
          }
        });

        const quizzesAttempted = new Set(quizAttempts.map(a => a.quizId)).size;
        const passedQuizzes = quizAttempts.filter(a => a.passed);
        const quizzesPassed = new Set(passedQuizzes.map(a => a.quizId)).size;
        const averageQuizScore = quizAttempts.length > 0 
          ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length 
          : 0;

        // Calculate total time spent (from session tracking)
        const sessions = await prisma.userSession.findMany({
          where: {
            userId: userId,
            courseId: course.id,
            startTime: {
              gte: startDate
            }
          }
        });

        const totalTimeSpent = sessions.reduce((sum, session) => {
          const duration = session.endTime 
            ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60) // minutes
            : 0;
          return sum + duration;
        }, 0);

        // Get last access date
        const lastAccess = await prisma.userSession.findFirst({
          where: {
            userId: userId,
            courseId: course.id
          },
          orderBy: {
            startTime: 'desc'
          }
        });

        // Calculate engagement score (0-100)
        const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
        const quizPerformance = averageQuizScore;
        const timeEngagement = Math.min((totalTimeSpent / 60) / 20, 1) * 100; // normalize to 20 hours
        const recencyScore = lastAccess 
          ? Math.max(0, 100 - ((now.getTime() - lastAccess.startTime.getTime()) / (1000 * 60 * 60 * 24))) // days ago
          : 0;

        const engagementScore = (progressPercentage * 0.3 + quizPerformance * 0.3 + timeEngagement * 0.2 + recencyScore * 0.2);

        const isCompleted = enrollment.completedAt !== null;
        const certificateIssued = await prisma.certificate.findFirst({
          where: {
            userId: userId,
            courseId: course.id
          }
        });

        return {
          id: enrollment.id,
          userId: userId,
          courseId: course.id,
          enrollmentDate: enrollment.enrolledAt.toISOString(),
          lastAccessDate: lastAccess?.startTime.toISOString() || enrollment.enrolledAt.toISOString(),
          totalTimeSpent: Math.round(totalTimeSpent),
          progressPercentage: Math.round(progressPercentage * 100) / 100,
          lessonsCompleted: completedLessons,
          totalLessons: totalLessons,
          quizzesAttempted: quizzesAttempted,
          quizzesPassed: quizzesPassed,
          averageQuizScore: Math.round(averageQuizScore * 100) / 100,
          isCompleted: isCompleted,
          completionDate: enrollment.completedAt?.toISOString(),
          certificateIssued: !!certificateIssued,
          engagementScore: Math.round(engagementScore)
        };
      })
    );

    return NextResponse.json({
      data: studentProgress,
      summary: {
        totalCourses: studentProgress.length,
        completedCourses: studentProgress.filter(p => p.isCompleted).length,
        averageProgress: studentProgress.length > 0 
          ? studentProgress.reduce((sum, p) => sum + p.progressPercentage, 0) / studentProgress.length 
          : 0,
        totalTimeSpent: studentProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0),
        averageEngagement: studentProgress.length > 0 
          ? studentProgress.reduce((sum, p) => sum + p.engagementScore, 0) / studentProgress.length 
          : 0
      }
    });

  } catch (error) {
    console.error('Failed to fetch student progress analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}