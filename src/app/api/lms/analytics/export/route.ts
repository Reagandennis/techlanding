import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { AnalyticsExportService } from '@/lib/analytics-export';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      type, 
      format: exportFormat, 
      userId, 
      courseId, 
      instructorId, 
      timeRange = '30days' 
    } = await request.json();

    let blob: Blob;
    let filename: string;
    let contentType: string;

    switch (type) {
      case 'student_progress': {
        if (!userId) {
          return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Check permissions
        const canAccess = session.user.id === userId || 
                         session.user.role === 'admin' || 
                         session.user.role === 'instructor';
        
        if (!canAccess) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch student progress data (simplified version of the analytics API)
        const enrollments = await prisma.enrollment.findMany({
          where: { 
            userId: userId,
            ...(courseId && { courseId })
          },
          include: {
            course: {
              include: {
                lessons: true
              }
            },
            progress: true
          }
        });

        const studentProgress = await Promise.all(
          enrollments.map(async (enrollment) => {
            const course = enrollment.course;
            const completedLessons = enrollment.progress.filter(p => p.completed).length;
            
            const quizAttempts = await prisma.quizAttempt.findMany({
              where: {
                userId: userId,
                quiz: { courseId: course.id }
              }
            });

            return {
              id: enrollment.id,
              userId,
              courseId: course.id,
              enrollmentDate: enrollment.enrolledAt.toISOString(),
              lastAccessDate: enrollment.updatedAt.toISOString(),
              totalTimeSpent: Math.floor(Math.random() * 300) + 60, // Mock data
              progressPercentage: course.lessons.length > 0 ? (completedLessons / course.lessons.length) * 100 : 0,
              lessonsCompleted: completedLessons,
              totalLessons: course.lessons.length,
              quizzesAttempted: quizAttempts.length,
              quizzesPassed: quizAttempts.filter(a => a.passed).length,
              averageQuizScore: quizAttempts.length > 0 
                ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length 
                : 0,
              isCompleted: !!enrollment.completedAt,
              completionDate: enrollment.completedAt?.toISOString(),
              certificateIssued: false, // Mock
              engagementScore: Math.floor(Math.random() * 40) + 60
            };
          })
        );

        const summary = {
          totalCourses: studentProgress.length,
          completedCourses: studentProgress.filter(p => p.isCompleted).length,
          averageProgress: studentProgress.length > 0 
            ? studentProgress.reduce((sum, p) => sum + p.progressPercentage, 0) / studentProgress.length 
            : 0,
          totalTimeSpent: studentProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0),
          averageEngagement: studentProgress.length > 0 
            ? studentProgress.reduce((sum, p) => sum + p.engagementScore, 0) / studentProgress.length 
            : 0
        };

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const studentName = user?.name || 'Unknown Student';

        if (exportFormat === 'pdf') {
          blob = await AnalyticsExportService.exportStudentProgressToPDF(
            studentProgress, 
            summary, 
            studentName
          );
          filename = `student-progress-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
          contentType = 'application/pdf';
        } else {
          blob = await AnalyticsExportService.exportStudentProgressToExcel(
            studentProgress, 
            summary, 
            studentName
          );
          filename = `student-progress-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        break;
      }

      case 'course_analytics': {
        // Check permissions
        const canAccessAll = session.user.role === 'admin';
        const isInstructor = session.user.role === 'instructor';

        if (!canAccessAll && !isInstructor) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const whereClause: any = {};
        if (courseId) whereClause.id = courseId;
        if (!canAccessAll && isInstructor) {
          whereClause.instructorId = instructorId || session.user.id;
        } else if (instructorId) {
          whereClause.instructorId = instructorId;
        }

        const courses = await prisma.course.findMany({
          where: whereClause,
          include: {
            instructor: true,
            enrollments: true,
            reviews: true
          }
        });

        const courseAnalytics = courses.map(course => {
          const enrollments = course.enrollments;
          const completedEnrollments = enrollments.filter(e => e.completedAt !== null);
          const reviews = course.reviews;

          return {
            courseId: course.id,
            courseName: course.title,
            instructorId: course.instructorId,
            instructorName: course.instructor.name,
            totalEnrollments: enrollments.length,
            activeStudents: Math.floor(enrollments.length * 0.7), // Mock
            completionRate: enrollments.length > 0 ? (completedEnrollments.length / enrollments.length) * 100 : 0,
            averageRating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
            totalRatings: reviews.length,
            averageTimeToComplete: Math.floor(Math.random() * 30) + 15, // Mock
            revenue: Math.floor(Math.random() * 10000) + 1000, // Mock
            enrollmentTrend: [],
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            topPerformingLessons: [],
            strugglingAreas: [],
            lastUpdated: new Date().toISOString()
          };
        });

        const summary = {
          totalCourses: courseAnalytics.length,
          totalEnrollments: courseAnalytics.reduce((sum, c) => sum + c.totalEnrollments, 0),
          totalRevenue: courseAnalytics.reduce((sum, c) => sum + c.revenue, 0),
          averageRating: courseAnalytics.length > 0 
            ? courseAnalytics.reduce((sum, c) => sum + c.averageRating, 0) / courseAnalytics.length 
            : 0,
          averageCompletion: courseAnalytics.length > 0 
            ? courseAnalytics.reduce((sum, c) => sum + c.completionRate, 0) / courseAnalytics.length 
            : 0
        };

        const instructor = instructorId 
          ? await prisma.user.findUnique({ where: { id: instructorId } })
          : null;

        if (exportFormat === 'pdf') {
          blob = await AnalyticsExportService.exportCourseAnalyticsToPDF(
            courseAnalytics, 
            summary, 
            instructor?.name
          );
          filename = `course-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
          contentType = 'application/pdf';
        } else {
          blob = await AnalyticsExportService.exportCourseAnalyticsToExcel(
            courseAnalytics, 
            summary, 
            instructor?.name
          );
          filename = `course-analytics-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        break;
      }

      case 'admin_dashboard': {
        if (session.user.role !== 'admin') {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Fetch basic admin data (simplified)
        const [totalUsers, totalCourses, totalEnrollments, allReviews] = await Promise.all([
          prisma.user.count(),
          prisma.course.count(),
          prisma.enrollment.count(),
          prisma.review.findMany()
        ]);

        // Mock admin dashboard data for export
        const dashboardData = {
          overview: {
            totalUsers,
            totalCourses,
            totalRevenue: 150000,
            totalEnrollments,
            activeUsers: Math.floor(totalUsers * 0.6),
            completionRate: 75,
            averageRating: allReviews.length > 0 
              ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
              : 4.2,
            monthlyGrowthRate: 12.5
          },
          userGrowth: [],
          revenueAnalytics: {
            totalRevenue: 150000,
            monthlyRevenue: [],
            revenueByCategory: [],
            subscriptionRevenue: 90000,
            oneTimeRevenue: 60000,
            refunds: 5000,
            netRevenue: 145000
          },
          coursePerformance: [], // Would fetch top courses
          instructorRankings: [], // Would fetch top instructors
          systemHealth: {
            uptime: 99.9,
            averageResponseTime: 250,
            errorRate: 0.1,
            serverLoad: 45,
            databasePerformance: 12,
            cdnPerformance: 85,
            lastUpdated: new Date().toISOString()
          },
          geographicDistribution: []
        };

        if (exportFormat === 'pdf') {
          blob = await AnalyticsExportService.exportAdminDashboardToPDF(dashboardData);
          filename = `admin-dashboard-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
          contentType = 'application/pdf';
        } else {
          // For admin dashboard Excel export, create a comprehensive report
          const exportData = {
            title: 'Admin Dashboard Report',
            data: [dashboardData.overview],
            summary: {
              'Report Generated': format(new Date(), 'PPP'),
              'Total Users': totalUsers,
              'Total Courses': totalCourses,
              'Total Enrollments': totalEnrollments,
              'Platform Revenue': '$150,000'
            }
          };

          blob = await AnalyticsExportService.exportToExcel(exportData);
          filename = `admin-dashboard-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    // Convert blob to base64 for JSON response
    const buffer = await blob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return NextResponse.json({
      success: true,
      filename,
      contentType,
      data: base64
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}