import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { CourseAnalytics, EnrollmentTrendData, LessonPerformance, StrugglePoint } from '@/types/analytics';
import { subDays, subWeeks, subMonths, format, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30days';
    const courseId = searchParams.get('courseId');
    const instructorId = searchParams.get('instructorId');

    // Check permissions - instructors can see their own courses, admins see all
    const canAccessAll = session.user.role === 'admin';
    const isInstructor = session.user.role === 'instructor';

    if (!canAccessAll && !isInstructor) {
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
      case '1year':
        startDate = subDays(now, 365);
        break;
      default:
        startDate = subDays(now, 30);
    }

    // Build where clause for courses
    const courseWhereClause: any = {};
    
    if (courseId) {
      courseWhereClause.id = courseId;
    }

    if (!canAccessAll && isInstructor) {
      courseWhereClause.instructorId = instructorId || session.user.id;
    } else if (instructorId) {
      courseWhereClause.instructorId = instructorId;
    }

    // Fetch courses with related data
    const courses = await prisma.course.findMany({
      where: courseWhereClause,
      include: {
        instructor: true,
        lessons: true,
        quizzes: true,
        enrollments: {
          where: {
            enrolledAt: {
              gte: startDate
            }
          }
        },
        reviews: true
      }
    });

    // Calculate analytics for each course
    const courseAnalytics: CourseAnalytics[] = await Promise.all(
      courses.map(async (course) => {
        // Get all enrollments (not just recent ones for total counts)
        const allEnrollments = await prisma.enrollment.findMany({
          where: {
            courseId: course.id
          }
        });

        const totalEnrollments = allEnrollments.length;
        const completedEnrollments = allEnrollments.filter(e => e.completedAt !== null);
        const completionRate = totalEnrollments > 0 ? (completedEnrollments.length / totalEnrollments) * 100 : 0;

        // Active students (accessed in last 30 days)
        const activeStudents = await prisma.userSession.count({
          where: {
            courseId: course.id,
            startTime: {
              gte: subDays(now, 30)
            }
          },
          distinct: ['userId']
        });

        // Calculate average rating
        const reviews = course.reviews;
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0;

        // Calculate revenue (assuming we have payments)
        const payments = await prisma.payment.findMany({
          where: {
            courseId: course.id,
            status: 'completed'
          }
        });

        const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

        // Calculate average time to complete
        const averageTimeToComplete = completedEnrollments.length > 0
          ? completedEnrollments.reduce((sum, e) => {
              const days = (e.completedAt!.getTime() - e.enrolledAt.getTime()) / (1000 * 60 * 60 * 24);
              return sum + days;
            }, 0) / completedEnrollments.length
          : 0;

        // Get enrollment trend data
        const enrollmentTrend: EnrollmentTrendData[] = [];
        const daysToCheck = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
        
        for (let i = daysToCheck - 1; i >= 0; i--) {
          const date = subDays(now, i);
          const dayStart = startOfDay(date);
          const dayEnd = endOfDay(date);

          const enrollments = await prisma.enrollment.count({
            where: {
              courseId: course.id,
              enrolledAt: {
                gte: dayStart,
                lte: dayEnd
              }
            }
          });

          const completions = await prisma.enrollment.count({
            where: {
              courseId: course.id,
              completedAt: {
                gte: dayStart,
                lte: dayEnd
              }
            }
          });

          // Calculate dropouts (enrolled but no activity for 14+ days)
          const enrolledUsers = await prisma.enrollment.findMany({
            where: {
              courseId: course.id,
              enrolledAt: {
                lte: subDays(date, 14)
              },
              completedAt: null
            },
            select: { userId: true }
          });

          const recentActivity = await prisma.userSession.findMany({
            where: {
              courseId: course.id,
              userId: {
                in: enrolledUsers.map(e => e.userId)
              },
              startTime: {
                gte: subDays(date, 14),
                lte: dayEnd
              }
            },
            distinct: ['userId']
          });

          const dropouts = enrolledUsers.length - recentActivity.length;

          enrollmentTrend.push({
            date: format(date, 'yyyy-MM-dd'),
            enrollments,
            completions,
            dropouts
          });
        }

        // Rating distribution
        const ratingDistribution = {
          1: reviews.filter(r => r.rating === 1).length,
          2: reviews.filter(r => r.rating === 2).length,
          3: reviews.filter(r => r.rating === 3).length,
          4: reviews.filter(r => r.rating === 4).length,
          5: reviews.filter(r => r.rating === 5).length,
        };

        // Get lesson performance data
        const lessonProgress = await prisma.progress.groupBy({
          by: ['lessonId'],
          where: {
            lesson: {
              courseId: course.id
            },
            completed: true
          },
          _count: {
            id: true
          }
        });

        const topPerformingLessons: LessonPerformance[] = await Promise.all(
          lessonProgress
            .sort((a, b) => b._count.id - a._count.id)
            .slice(0, 5)
            .map(async (lp) => {
              const lesson = await prisma.lesson.findUnique({
                where: { id: lp.lessonId }
              });

              const totalAttempts = await prisma.progress.count({
                where: { lessonId: lp.lessonId }
              });

              const completionRate = totalAttempts > 0 ? (lp._count.id / totalAttempts) * 100 : 0;

              // Calculate average time spent (mock data for now)
              const averageTimeSpent = Math.floor(Math.random() * 30) + 10; // 10-40 minutes

              return {
                lessonId: lp.lessonId,
                lessonTitle: lesson?.title || 'Unknown Lesson',
                completionRate,
                averageTimeSpent,
                studentFeedback: Math.floor(Math.random() * 5) + 1 // Mock rating
              };
            })
        );

        // Get struggling areas (lessons with high dropout)
        const allLessonProgress = await prisma.progress.groupBy({
          by: ['lessonId'],
          where: {
            lesson: {
              courseId: course.id
            }
          },
          _count: {
            id: true
          }
        });

        const strugglingAreas: StrugglePoint[] = await Promise.all(
          allLessonProgress
            .filter(lp => {
              const completedCount = lessonProgress.find(clp => clp.lessonId === lp.lessonId)?._count.id || 0;
              const dropoutRate = lp._count.id > 0 ? ((lp._count.id - completedCount) / lp._count.id) * 100 : 0;
              return dropoutRate > 50; // High dropout rate
            })
            .slice(0, 5)
            .map(async (lp) => {
              const lesson = await prisma.lesson.findUnique({
                where: { id: lp.lessonId }
              });

              const completedCount = lessonProgress.find(clp => clp.lessonId === lp.lessonId)?._count.id || 0;
              const dropoutRate = lp._count.id > 0 ? ((lp._count.id - completedCount) / lp._count.id) * 100 : 0;

              return {
                lessonId: lp.lessonId,
                lessonTitle: lesson?.title || 'Unknown Lesson',
                dropoutRate,
                averageAttempts: Math.floor(Math.random() * 3) + 1,
                commonIssues: ['Difficulty understanding concept', 'Technical issues', 'Time constraints']
              };
            })
        );

        return {
          courseId: course.id,
          courseName: course.title,
          instructorId: course.instructorId,
          instructorName: course.instructor.name,
          totalEnrollments,
          activeStudents,
          completionRate,
          averageRating,
          totalRatings: reviews.length,
          averageTimeToComplete: Math.round(averageTimeToComplete),
          revenue: revenue / 100, // Convert from cents to dollars
          enrollmentTrend,
          ratingDistribution,
          topPerformingLessons,
          strugglingAreas,
          lastUpdated: new Date().toISOString()
        };
      })
    );

    return NextResponse.json({
      data: courseAnalytics,
      summary: {
        totalCourses: courseAnalytics.length,
        totalEnrollments: courseAnalytics.reduce((sum, c) => sum + c.totalEnrollments, 0),
        totalRevenue: courseAnalytics.reduce((sum, c) => sum + c.revenue, 0),
        averageRating: courseAnalytics.length > 0 
          ? courseAnalytics.reduce((sum, c) => sum + c.averageRating, 0) / courseAnalytics.length 
          : 0,
        averageCompletion: courseAnalytics.length > 0 
          ? courseAnalytics.reduce((sum, c) => sum + c.completionRate, 0) / courseAnalytics.length 
          : 0
      }
    });

  } catch (error) {
    console.error('Failed to fetch course analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}