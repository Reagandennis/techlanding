import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { AdminDashboardData, UserGrowthData, MonthlyRevenue, CategoryRevenue } from '@/types/analytics';
import { subDays, subMonths, format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30days';

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

    // Platform Overview
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      activeUsers,
      allReviews,
      allPayments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { completedAt: { not: null } } }),
      prisma.userSession.count({
        where: {
          startTime: {
            gte: subDays(now, 30)
          }
        },
        distinct: ['userId']
      }),
      prisma.review.findMany(),
      prisma.payment.findMany({ where: { status: 'completed' } })
    ]);

    const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0) / 100; // Convert from cents
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 0;

    // Calculate monthly growth rate
    const lastMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: subDays(startOfMonth(subMonths(now, 1)), 0),
          lt: startOfMonth(now)
        }
      }
    });

    const thisMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth(now)
        }
      }
    });

    const monthlyGrowthRate = lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;

    // User Growth Data
    const userGrowthData: UserGrowthData[] = [];
    const daysToCheck = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;

    for (let i = daysToCheck - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const [totalUsersOnDate, newUsers, activeSessions] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              lte: dayEnd
            }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        }),
        prisma.userSession.count({
          where: {
            startTime: {
              gte: dayStart,
              lte: dayEnd
            }
          },
          distinct: ['userId']
        })
      ]);

      // Calculate churn rate (simplified - users who haven't been active in 30 days)
      const inactiveUsers = await prisma.user.count({
        where: {
          createdAt: {
            lte: subDays(date, 30)
          },
          // Not in recent sessions
          id: {
            notIn: await prisma.userSession.findMany({
              where: {
                startTime: {
                  gte: subDays(date, 30)
                }
              },
              distinct: ['userId'],
              select: { userId: true }
            }).then(sessions => sessions.map(s => s.userId))
          }
        }
      });

      const churnRate = totalUsersOnDate > 0 ? inactiveUsers / totalUsersOnDate : 0;

      userGrowthData.push({
        date: format(date, 'yyyy-MM-dd'),
        totalUsers: totalUsersOnDate,
        newUsers,
        activeUsers: activeSessions,
        churnRate
      });
    }

    // Revenue Analytics
    const monthsToCheck = timeRange === '1year' ? 12 : 6;
    const monthlyRevenue: MonthlyRevenue[] = [];

    for (let i = monthsToCheck - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const payments = await prisma.payment.findMany({
        where: {
          status: 'completed',
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });

      const subscriptionPayments = payments.filter(p => p.type === 'subscription');
      const oneTimePayments = payments.filter(p => p.type === 'one_time');
      const refunds = await prisma.payment.findMany({
        where: {
          status: 'refunded',
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });

      monthlyRevenue.push({
        month: format(date, 'yyyy-MM'),
        revenue: payments.reduce((sum, p) => sum + p.amount, 0) / 100,
        subscriptions: subscriptionPayments.reduce((sum, p) => sum + p.amount, 0) / 100,
        oneTimePurchases: oneTimePayments.reduce((sum, p) => sum + p.amount, 0) / 100,
        refunds: refunds.reduce((sum, p) => sum + p.amount, 0) / 100
      });
    }

    // Revenue by Category
    const courses = await prisma.course.findMany({
      include: {
        payments: {
          where: { status: 'completed' }
        }
      }
    });

    const categoryMap = new Map<string, { revenue: number; enrollments: number }>();
    
    courses.forEach(course => {
      const category = course.category || 'Uncategorized';
      const courseRevenue = course.payments.reduce((sum, p) => sum + p.amount, 0) / 100;
      const courseEnrollments = course.payments.length; // Simplified - using payments as proxy for enrollments

      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category)!;
        categoryMap.set(category, {
          revenue: existing.revenue + courseRevenue,
          enrollments: existing.enrollments + courseEnrollments
        });
      } else {
        categoryMap.set(category, {
          revenue: courseRevenue,
          enrollments: courseEnrollments
        });
      }
    });

    const revenueByCategory: CategoryRevenue[] = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      revenue: data.revenue,
      enrollments: data.enrollments,
      averagePrice: data.enrollments > 0 ? data.revenue / data.enrollments : 0
    }));

    // Top Courses
    const topCourses = await prisma.course.findMany({
      include: {
        instructor: true,
        enrollments: true,
        reviews: true,
        payments: {
          where: { status: 'completed' }
        }
      },
      orderBy: {
        payments: {
          _count: 'desc'
        }
      },
      take: 20
    });

    const coursePerformance = topCourses.map(course => {
      const enrollments = course.enrollments.length;
      const completed = course.enrollments.filter(e => e.completedAt !== null).length;
      const revenue = course.payments.reduce((sum, p) => sum + p.amount, 0) / 100;
      const rating = course.reviews.length > 0 
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length 
        : 0;

      return {
        courseId: course.id,
        title: course.title,
        instructorName: course.instructor.name,
        enrollments,
        revenue,
        rating,
        completionRate: enrollments > 0 ? (completed / enrollments) * 100 : 0
      };
    });

    // Instructor Rankings
    const instructors = await prisma.user.findMany({
      where: { role: 'instructor' },
      include: {
        coursesAsInstructor: {
          include: {
            enrollments: true,
            reviews: true,
            payments: {
              where: { status: 'completed' }
            }
          }
        }
      }
    });

    const instructorRankings = instructors
      .map(instructor => {
        const courses = instructor.coursesAsInstructor;
        const totalRevenue = courses.reduce((sum, c) => 
          sum + c.payments.reduce((pSum, p) => pSum + p.amount, 0), 0) / 100;
        const totalStudents = courses.reduce((sum, c) => sum + c.enrollments.length, 0);
        const totalRatings = courses.reduce((sum, c) => sum + c.reviews.length, 0);
        const averageRating = totalRatings > 0
          ? courses.reduce((sum, c) => 
              sum + c.reviews.reduce((rSum, r) => rSum + r.rating, 0), 0) / totalRatings
          : 0;

        return {
          instructorId: instructor.id,
          name: instructor.name,
          totalRevenue,
          totalStudents,
          averageRating,
          coursesCount: courses.length,
          rank: 0 // Will be set after sorting
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .map((instructor, index) => ({
        ...instructor,
        rank: index + 1
      }));

    // System Health (mock data for now)
    const systemHealth = {
      uptime: 99.9,
      averageResponseTime: 250,
      errorRate: 0.1,
      serverLoad: 45,
      databasePerformance: 12,
      cdnPerformance: 85,
      lastUpdated: new Date().toISOString()
    };

    // Geographic Distribution (mock data)
    const geographicDistribution = [
      { country: 'United States', users: 15420, revenue: 245000, topCourses: ['React Development', 'JavaScript Fundamentals'] },
      { country: 'Canada', users: 8930, revenue: 142000, topCourses: ['Python Programming', 'Data Science'] },
      { country: 'United Kingdom', users: 7250, revenue: 118000, topCourses: ['Web Development', 'Machine Learning'] },
      { country: 'Germany', users: 5680, revenue: 89000, topCourses: ['DevOps', 'Cloud Computing'] },
      { country: 'Australia', users: 4320, revenue: 67000, topCourses: ['Mobile Development', 'UI/UX Design'] },
      { country: 'India', users: 12100, revenue: 87000, topCourses: ['Full Stack Development', 'React Native'] },
      { country: 'Brazil', users: 3850, revenue: 45000, topCourses: ['Backend Development', 'Database Design'] },
      { country: 'France', users: 3200, revenue: 52000, topCourses: ['Frontend Development', 'Vue.js'] },
      { country: 'Netherlands', users: 2100, revenue: 38000, topCourses: ['Blockchain', 'Cryptocurrency'] },
      { country: 'Japan', users: 1800, revenue: 35000, topCourses: ['AI Development', 'Robotics'] }
    ];

    const adminDashboardData: AdminDashboardData = {
      overview: {
        totalUsers,
        totalCourses,
        totalRevenue,
        totalEnrollments,
        activeUsers,
        completionRate,
        averageRating,
        monthlyGrowthRate
      },
      userGrowth: userGrowthData,
      revenueAnalytics: {
        totalRevenue,
        monthlyRevenue,
        revenueByCategory,
        subscriptionRevenue: allPayments.filter(p => p.type === 'subscription')
          .reduce((sum, p) => sum + p.amount, 0) / 100,
        oneTimeRevenue: allPayments.filter(p => p.type === 'one_time')
          .reduce((sum, p) => sum + p.amount, 0) / 100,
        refunds: 5000, // Mock data
        netRevenue: totalRevenue - 5000
      },
      coursePerformance,
      instructorRankings,
      systemHealth,
      geographicDistribution
    };

    return NextResponse.json({
      data: adminDashboardData
    });

  } catch (error) {
    console.error('Failed to fetch admin analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}