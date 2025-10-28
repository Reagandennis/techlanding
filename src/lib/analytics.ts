import prisma from '@/lib/prisma';
import { CacheManager, DatabaseOptimizer } from './performance';
import { endOfDay, startOfDay, subDays, subMonths, format } from 'date-fns';

// Analytics interfaces
export interface PlatformMetrics {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersThisMonth: number;
  coursesCompletedThisMonth: number;
  averageCompletionRate: number;
  popularCourses: any[];
  revenueByMonth: any[];
  userGrowth: any[];
}

export interface InstructorMetrics {
  instructorId: string;
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  completionRate: number;
  engagementRate: number;
  topCourses: any[];
  recentActivity: any[];
  monthlyStats: any[];
}

export interface StudentMetrics {
  studentId: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  certificatesEarned: number;
  totalWatchTime: number;
  currentStreak: number;
  averageScore: number;
  learningPath: any[];
  achievements: any[];
  weeklyProgress: any[];
}

export interface CourseMetrics {
  courseId: string;
  totalEnrollments: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
  averageWatchTime: number;
  dropOffPoints: any[];
  studentFeedback: any[];
  engagementByLesson: any[];
  conversionRate: number;
}

export class AnalyticsService {
  /**
   * Get comprehensive platform analytics for admin dashboard
   */
  static async getPlatformMetrics(dateRange?: { from: Date; to: Date }): Promise<PlatformMetrics> {
    const cacheKey = `platform-metrics-${dateRange?.from?.toISOString()}-${dateRange?.to?.toISOString()}`;
    
    return DatabaseOptimizer.cachedQuery('analytics', cacheKey, async () => {
      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30);
      const startDate = dateRange?.from || thirtyDaysAgo;
      const endDate = dateRange?.to || now;

      // Parallel queries for better performance
      const [
        totalUsers,
        totalCourses,
        totalEnrollments,
        activeUsers,
        newUsers,
        completedCourses,
        revenueData,
        popularCourses,
        userGrowthData
      ] = await Promise.all([
        // Total users
        prisma.user.count({
          where: { deletedAt: null }
        }),

        // Total courses
        prisma.course.count({
          where: { published: true, deletedAt: null }
        }),

        // Total enrollments
        prisma.enrollment.count(),

        // Active users (logged in within last 30 days)
        prisma.user.count({
          where: {
            lastActivityDate: {
              gte: thirtyDaysAgo
            },
            deletedAt: null
          }
        }),

        // New users this month
        prisma.user.count({
          where: {
            createdAt: {
              gte: subMonths(now, 1)
            },
            deletedAt: null
          }
        }),

        // Courses completed this month
        prisma.progress.count({
          where: {
            completed: true,
            completedAt: {
              gte: subMonths(now, 1)
            }
          }
        }),

        // Revenue data
        prisma.payment.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          _sum: {
            amount: true
          }
        }),

        // Popular courses
        prisma.course.findMany({
          where: {
            published: true,
            deletedAt: null
          },
          include: {
            _count: {
              select: {
                enrollments: true,
                reviews: true
              }
            },
            reviews: {
              select: {
                rating: true
              }
            }
          },
          orderBy: {
            enrollments: {
              _count: 'desc'
            }
          },
          take: 10
        }),

        // User growth over time
        this.getUserGrowthData(startDate, endDate)
      ]);

      // Calculate average completion rate
      const completionRateData = await prisma.progress.groupBy({
        by: ['courseId'],
        _count: {
          _all: true
        },
        _sum: {
          completed: true
        }
      });

      const averageCompletionRate = completionRateData.length > 0 
        ? completionRateData.reduce((acc, curr) => acc + (curr._sum.completed || 0) / curr._count._all, 0) / completionRateData.length * 100
        : 0;

      // Get revenue by month
      const revenueByMonth = await this.getRevenueByMonth(startDate, endDate);

      return {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: Number(revenueData._sum.amount || 0),
        activeUsers,
        newUsersThisMonth: newUsers,
        coursesCompletedThisMonth: completedCourses,
        averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
        popularCourses: popularCourses.map(course => ({
          id: course.id,
          title: course.title,
          enrollments: course._count.enrollments,
          averageRating: course.reviews.length > 0 
            ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
            : 0,
          thumbnail: course.thumbnail
        })),
        revenueByMonth,
        userGrowth: userGrowthData
      };
    }, 1000 * 60 * 15); // 15 minutes cache
  }

  /**
   * Get instructor-specific analytics
   */
  static async getInstructorMetrics(instructorId: string, dateRange?: { from: Date; to: Date }): Promise<InstructorMetrics> {
    const cacheKey = `instructor-metrics-${instructorId}-${dateRange?.from?.toISOString()}-${dateRange?.to?.toISOString()}`;
    
    return DatabaseOptimizer.cachedQuery('analytics', cacheKey, async () => {
      const now = new Date();
      const startDate = dateRange?.from || subDays(now, 30);
      const endDate = dateRange?.to || now;

      const [
        courses,
        totalStudents,
        revenueData,
        ratingsData
      ] = await Promise.all([
        // Instructor's courses with enrollment data
        prisma.course.findMany({
          where: {
            instructorId,
            deletedAt: null
          },
          include: {
            _count: {
              select: {
                enrollments: true,
                reviews: true
              }
            },
            enrollments: {
              include: {
                progress: true
              }
            },
            reviews: {
              select: {
                rating: true
              }
            },
            analytics: {
              where: {
                date: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          }
        }),

        // Total unique students across all courses
        prisma.enrollment.findMany({
          where: {
            course: {
              instructorId,
              deletedAt: null
            }
          },
          select: {
            userId: true
          },
          distinct: ['userId']
        }),

        // Revenue from instructor's courses
        prisma.payment.aggregate({
          where: {
            course: {
              instructorId
            },
            status: 'COMPLETED',
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          _sum: {
            amount: true
          }
        }),

        // Average ratings
        prisma.review.aggregate({
          where: {
            course: {
              instructorId
            }
          },
          _avg: {
            rating: true
          },
          _count: {
            rating: true
          }
        })
      ]);

      // Calculate completion rate
      const totalEnrollments = courses.reduce((acc, course) => acc + course._count.enrollments, 0);
      const completedEnrollments = courses.reduce((acc, course) => {
        return acc + course.enrollments.filter(e => e.progress?.some(p => p.completed)).length;
      }, 0);
      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

      // Calculate engagement rate (active enrollments in last 7 days)
      const weekAgo = subDays(now, 7);
      const activeEnrollments = courses.reduce((acc, course) => {
        return acc + course.enrollments.filter(e => 
          e.progress?.some(p => p.lastAccessedAt && p.lastAccessedAt >= weekAgo)
        ).length;
      }, 0);
      const engagementRate = totalEnrollments > 0 ? (activeEnrollments / totalEnrollments) * 100 : 0;

      // Top performing courses
      const topCourses = courses
        .map(course => ({
          id: course.id,
          title: course.title,
          enrollments: course._count.enrollments,
          completionRate: course.enrollments.length > 0 
            ? (course.enrollments.filter(e => e.progress?.some(p => p.completed)).length / course.enrollments.length) * 100
            : 0,
          averageRating: course.reviews.length > 0 
            ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
            : 0,
          revenue: course.analytics.reduce((acc, analytics) => acc + Number(analytics.totalRevenue), 0)
        }))
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 5);

      // Monthly stats
      const monthlyStats = await this.getInstructorMonthlyStats(instructorId, startDate, endDate);

      return {
        instructorId,
        totalCourses: courses.length,
        totalStudents: totalStudents.length,
        totalRevenue: Number(revenueData._sum.amount || 0),
        averageRating: Number(ratingsData._avg.rating || 0),
        completionRate: Math.round(completionRate * 100) / 100,
        engagementRate: Math.round(engagementRate * 100) / 100,
        topCourses,
        recentActivity: [], // This would be populated from activity logs
        monthlyStats
      };
    }, 1000 * 60 * 10); // 10 minutes cache
  }

  /**
   * Get student-specific analytics
   */
  static async getStudentMetrics(studentId: string): Promise<StudentMetrics> {
    const cacheKey = `student-metrics-${studentId}`;
    
    return DatabaseOptimizer.cachedQuery('analytics', cacheKey, async () => {
      const [
        enrollments,
        progress,
        quizAttempts,
        certificates,
        achievements,
        userAnalytics
      ] = await Promise.all([
        // Student enrollments
        prisma.enrollment.findMany({
          where: { userId: studentId },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnail: true
              }
            }
          }
        }),

        // Learning progress
        prisma.progress.findMany({
          where: { userId: studentId },
          include: {
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }),

        // Quiz performance
        prisma.quizAttempt.findMany({
          where: { userId: studentId },
          include: {
            quiz: {
              select: {
                title: true,
                totalQuestions: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),

        // Certificates
        prisma.certificate.findMany({
          where: { userId: studentId },
          include: {
            course: {
              select: {
                title: true
              }
            }
          }
        }),

        // Achievements
        prisma.achievement.findMany({
          where: { userId: studentId },
          orderBy: { earnedAt: 'desc' }
        }),

        // User analytics
        prisma.userAnalytics.findMany({
          where: { userId: studentId },
          orderBy: { date: 'desc' },
          take: 30 // Last 30 days
        })
      ]);

      const coursesCompleted = progress.filter(p => p.completed).length;
      const totalWatchTime = userAnalytics.reduce((acc, analytics) => acc + analytics.totalWatchTime, 0);
      const currentStreak = userAnalytics[0]?.currentStreak || 0;
      
      // Calculate average quiz score
      const averageScore = quizAttempts.length > 0 
        ? quizAttempts.reduce((acc, attempt) => acc + attempt.score, 0) / quizAttempts.length
        : 0;

      // Learning path (recommended next courses based on completed ones)
      const learningPath = await this.getRecommendedCourses(studentId, progress);

      // Weekly progress for last 7 weeks
      const weeklyProgress = await this.getWeeklyProgress(studentId);

      return {
        studentId,
        coursesEnrolled: enrollments.length,
        coursesCompleted,
        certificatesEarned: certificates.length,
        totalWatchTime,
        currentStreak,
        averageScore: Math.round(averageScore * 100) / 100,
        learningPath,
        achievements: achievements.map(achievement => ({
          type: achievement.type,
          title: achievement.title,
          description: achievement.description,
          earnedAt: achievement.earnedAt,
          points: achievement.points
        })),
        weeklyProgress
      };
    }, 1000 * 60 * 5); // 5 minutes cache
  }

  /**
   * Get course-specific analytics
   */
  static async getCourseMetrics(courseId: string, dateRange?: { from: Date; to: Date }): Promise<CourseMetrics> {
    const cacheKey = `course-metrics-${courseId}-${dateRange?.from?.toISOString()}-${dateRange?.to?.toISOString()}`;
    
    return DatabaseOptimizer.cachedQuery('analytics', cacheKey, async () => {
      const now = new Date();
      const startDate = dateRange?.from || subDays(now, 30);
      const endDate = dateRange?.to || now;

      const [
        enrollments,
        progress,
        reviews,
        revenueData,
        lessonProgress,
        courseViews
      ] = await Promise.all([
        // Course enrollments
        prisma.enrollment.count({
          where: { courseId }
        }),

        // Progress data
        prisma.progress.findMany({
          where: { courseId },
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }),

        // Reviews and ratings
        prisma.review.findMany({
          where: { courseId },
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),

        // Revenue data
        prisma.payment.aggregate({
          where: {
            courseId,
            status: 'COMPLETED',
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          _sum: {
            amount: true
          }
        }),

        // Lesson-level progress for engagement analysis
        prisma.lessonProgress.findMany({
          where: {
            lesson: {
              courseId
            }
          },
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                order: true
              }
            }
          }
        }),

        // Course page views (this would need to be tracked separately)
        prisma.courseAnalytics.findMany({
          where: {
            courseId,
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        })
      ]);

      const completionRate = enrollments > 0 
        ? (progress.filter(p => p.completed).length / enrollments) * 100
        : 0;

      const averageRating = reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : 0;

      const totalRevenue = Number(revenueData._sum.amount || 0);
      
      // Calculate average watch time
      const averageWatchTime = progress.length > 0
        ? progress.reduce((acc, p) => acc + p.watchTime, 0) / progress.length
        : 0;

      // Identify drop-off points
      const dropOffPoints = this.calculateDropOffPoints(lessonProgress);

      // Engagement by lesson
      const engagementByLesson = this.calculateLessonEngagement(lessonProgress);

      // Calculate conversion rate (views to enrollments)
      const totalViews = courseViews.reduce((acc, analytics) => acc + analytics.totalEnrollments, 0);
      const conversionRate = totalViews > 0 ? (enrollments / totalViews) * 100 : 0;

      return {
        courseId,
        totalEnrollments: enrollments,
        completionRate: Math.round(completionRate * 100) / 100,
        averageRating: Math.round(averageRating * 100) / 100,
        totalRevenue,
        averageWatchTime: Math.round(averageWatchTime),
        dropOffPoints,
        studentFeedback: reviews.slice(0, 5), // Latest 5 reviews
        engagementByLesson,
        conversionRate: Math.round(conversionRate * 100) / 100
      };
    }, 1000 * 60 * 10); // 10 minutes cache
  }

  // Helper methods
  private static async getUserGrowthData(startDate: Date, endDate: Date) {
    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        deletedAt: null
      },
      _count: {
        _all: true
      }
    });

    // Group by day and aggregate
    const growthByDay = userGrowth.reduce((acc, curr) => {
      const day = format(curr.createdAt, 'yyyy-MM-dd');
      acc[day] = (acc[day] || 0) + curr._count._all;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(growthByDay).map(([date, count]) => ({
      date,
      newUsers: count
    }));
  }

  private static async getRevenueByMonth(startDate: Date, endDate: Date) {
    const revenueData = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    });

    // Group by month
    const revenueByMonth = revenueData.reduce((acc, curr) => {
      const month = format(curr.createdAt, 'yyyy-MM');
      acc[month] = (acc[month] || 0) + Number(curr._sum.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(revenueByMonth).map(([month, revenue]) => ({
      month,
      revenue
    }));
  }

  private static async getInstructorMonthlyStats(instructorId: string, startDate: Date, endDate: Date) {
    // This would aggregate monthly data for the instructor
    const monthlyStats = await prisma.courseAnalytics.groupBy({
      by: ['date'],
      where: {
        course: {
          instructorId
        },
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        totalEnrollments: true,
        totalRevenue: true
      },
      _avg: {
        completionRate: true,
        averageRating: true
      }
    });

    return monthlyStats.map(stat => ({
      month: format(stat.date, 'yyyy-MM'),
      enrollments: stat._sum.totalEnrollments || 0,
      revenue: Number(stat._sum.totalRevenue || 0),
      completionRate: Number(stat._avg.completionRate || 0),
      averageRating: Number(stat._avg.averageRating || 0)
    }));
  }

  private static async getRecommendedCourses(studentId: string, completedProgress: any[]) {
    // Simple recommendation based on completed course categories
    // In a real system, this would be more sophisticated
    const completedCourseIds = completedProgress.filter(p => p.completed).map(p => p.courseId);
    
    if (completedCourseIds.length === 0) {
      // Return beginner courses
      return prisma.course.findMany({
        where: {
          level: 'BEGINNER',
          published: true,
          deletedAt: null
        },
        take: 3,
        select: {
          id: true,
          title: true,
          thumbnail: true,
          level: true
        }
      });
    }

    // Get courses in similar categories (simplified)
    return prisma.course.findMany({
      where: {
        published: true,
        deletedAt: null,
        id: {
          notIn: completedCourseIds
        }
      },
      take: 3,
      select: {
        id: true,
        title: true,
        thumbnail: true,
        level: true
      }
    });
  }

  private static async getWeeklyProgress(studentId: string) {
    const sevenWeeksAgo = subDays(new Date(), 49); // 7 weeks
    
    const weeklyData = await prisma.lessonProgress.groupBy({
      by: ['completedAt'],
      where: {
        userId: studentId,
        completed: true,
        completedAt: {
          gte: sevenWeeksAgo
        }
      },
      _count: {
        _all: true
      }
    });

    // Group by week
    const weeklyProgress = weeklyData.reduce((acc, curr) => {
      if (!curr.completedAt) return acc;
      
      const week = format(curr.completedAt, 'yyyy-ww');
      acc[week] = (acc[week] || 0) + curr._count._all;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(weeklyProgress).map(([week, completedLessons]) => ({
      week,
      completedLessons
    }));
  }

  private static calculateDropOffPoints(lessonProgress: any[]) {
    // Analyze where students typically drop off
    const lessonCompletionRates = lessonProgress.reduce((acc, progress) => {
      const lessonId = progress.lesson.id;
      const lessonOrder = progress.lesson.order;
      
      if (!acc[lessonId]) {
        acc[lessonId] = {
          lessonId,
          title: progress.lesson.title,
          order: lessonOrder,
          started: 0,
          completed: 0
        };
      }
      
      acc[lessonId].started++;
      if (progress.completed) {
        acc[lessonId].completed++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(lessonCompletionRates)
      .map((lesson: any) => ({
        ...lesson,
        completionRate: (lesson.completed / lesson.started) * 100,
        dropOffRate: ((lesson.started - lesson.completed) / lesson.started) * 100
      }))
      .sort((a, b) => b.dropOffRate - a.dropOffRate)
      .slice(0, 5); // Top 5 drop-off points
  }

  private static calculateLessonEngagement(lessonProgress: any[]) {
    return lessonProgress.reduce((acc, progress) => {
      const lessonId = progress.lesson.id;
      
      if (!acc[lessonId]) {
        acc[lessonId] = {
          lessonId,
          title: progress.lesson.title,
          order: progress.lesson.order,
          totalWatchTime: 0,
          totalStudents: 0,
          completionRate: 0
        };
      }
      
      acc[lessonId].totalWatchTime += progress.watchTime || 0;
      acc[lessonId].totalStudents++;
      if (progress.completed) {
        acc[lessonId].completionRate++;
      }
      
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Track user activity for analytics
   */
  static async trackUserActivity(userId: string, activity: {
    action: string;
    resourceType: string;
    resourceId: string;
    metadata?: any;
  }) {
    // This would log user activities for analytics
    // Implementation would depend on your activity tracking requirements
    console.log('User activity tracked:', { userId, ...activity });
  }

  /**
   * Update user analytics daily
   */
  static async updateDailyAnalytics(userId: string) {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Get user's activity for today
    const todayProgress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    const watchTimeToday = todayProgress.reduce((acc, progress) => acc + (progress.watchTime || 0), 0);

    // Update or create analytics record
    await prisma.userAnalytics.upsert({
      where: {
        userId_date: {
          userId,
          date: todayStart
        }
      },
      update: {
        totalWatchTime: watchTimeToday
      },
      create: {
        userId,
        date: todayStart,
        totalWatchTime: watchTimeToday
      }
    });
  }
}