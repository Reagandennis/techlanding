import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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
      select: { 
        id: true, 
        role: true, 
        name: true, 
        email: true, 
        imageUrl: true,
        createdAt: true 
      }
    });

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can access this dashboard' },
        { status: 403 }
      );
    }

    // Get enrolled courses with progress
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true,
                imageUrl: true
              }
            },
            category: {
              select: {
                name: true,
                color: true
              }
            },
            lessons: {
              select: {
                id: true,
                duration: true
              }
            },
            _count: {
              select: {
                lessons: true
              }
            }
          }
        }
      }
    });

    // Calculate progress for each course
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.course;
        
        // Get completed lessons count
        const completedLessons = await prisma.progress.count({
          where: {
            userId: user.id,
            courseId: course.id,
            isCompleted: true
          }
        });

        // Get last accessed lesson
        const lastProgress = await prisma.progress.findFirst({
          where: {
            userId: user.id,
            courseId: course.id
          },
          orderBy: {
            updatedAt: 'desc'
          }
        });

        // Calculate total duration
        const totalDuration = course.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

        // Check if certificate is earned (course completed)
        const certificateEarned = completedLessons === course._count.lessons && course._count.lessons > 0;

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnailUrl: course.thumbnailUrl,
          instructor: {
            name: course.instructor.name,
            avatar: course.instructor.imageUrl
          },
          progress: {
            completedLessons,
            totalLessons: course._count.lessons,
            percentage: course._count.lessons > 0 ? Math.round((completedLessons / course._count.lessons) * 100) : 0,
            lastAccessedAt: lastProgress?.updatedAt?.toISOString() || null
          },
          enrolledAt: enrollment.enrolledAt.toISOString(),
          category: {
            name: course.category?.name || 'General',
            color: course.category?.color || '#6B7280'
          },
          totalDuration,
          certificateEarned
        };
      })
    );

    // Get learning statistics
    const totalCompletedLessons = await prisma.progress.count({
      where: {
        userId: user.id,
        isCompleted: true
      }
    });

    const totalQuizzesPassed = await prisma.quizAttempt.count({
      where: {
        userId: user.id,
        isPassed: true
      }
    });

    const totalAssignmentsSubmitted = await prisma.assignmentSubmission.count({
      where: {
        userId: user.id
      }
    });

    // Calculate average quiz score
    const avgQuizScore = await prisma.quizAttempt.aggregate({
      where: {
        userId: user.id,
        isPassed: true
      },
      _avg: {
        percentage: true
      }
    });

    // Calculate total learning time
    const completedLessonIds = await prisma.progress.findMany({
      where: {
        userId: user.id,
        isCompleted: true
      },
      select: {
        lessonId: true
      }
    });

    const completedLessonDurations = await prisma.lesson.findMany({
      where: {
        id: { in: completedLessonIds.map(p => p.lessonId) }
      },
      select: {
        duration: true
      }
    });

    const totalLearningTime = completedLessonDurations.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

    // Calculate learning streak
    const recentActivity = await prisma.progress.findMany({
      where: {
        userId: user.id,
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const uniqueDays = [...new Set(recentActivity.map(a => 
      new Date(a.updatedAt).toDateString()
    ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (uniqueDays.includes(today) || uniqueDays.includes(yesterday)) {
      currentStreak = 1;
      const startDate = uniqueDays.includes(today) ? new Date() : new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      for (let i = 1; i < uniqueDays.length; i++) {
        const checkDate = new Date(startDate.getTime() - i * 24 * 60 * 60 * 1000).toDateString();
        if (uniqueDays.includes(checkDate)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Get upcoming items
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        course: {
          enrollments: {
            some: {
              userId: user.id
            }
          }
        },
        dueDate: {
          gte: new Date()
        }
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        submissions: {
          where: {
            userId: user.id
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      },
      take: 10
    });

    const upcomingItems = upcomingAssignments
      .filter(assignment => assignment.submissions.length === 0)
      .map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        type: 'ASSIGNMENT' as const,
        dueDate: assignment.dueDate!.toISOString(),
        course: {
          id: assignment.course.id,
          title: assignment.course.title
        },
        status: new Date() > assignment.dueDate! ? 'OVERDUE' as const : 'PENDING' as const
      }));

    // Get recent activity
    const recentLessonCompletions = await prisma.progress.findMany({
      where: {
        userId: user.id,
        isCompleted: true,
        completedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        lesson: {
          select: {
            title: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 5
    });

    const recentQuizAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        isPassed: true,
        completedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        quiz: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 5
    });

    const recentActivityItems = [
      ...recentLessonCompletions.map(progress => ({
        id: `lesson-${progress.id}`,
        type: 'LESSON_COMPLETED' as const,
        title: progress.lesson.title,
        course: progress.course.title,
        timestamp: progress.completedAt!.toISOString()
      })),
      ...recentQuizAttempts.map(attempt => ({
        id: `quiz-${attempt.id}`,
        type: 'QUIZ_PASSED' as const,
        title: attempt.quiz.title,
        course: 'Quiz',
        timestamp: attempt.completedAt!.toISOString(),
        score: attempt.percentage
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    // Get achievements
    const achievements = [];
    
    if (coursesWithProgress.some(c => c.certificateEarned)) {
      achievements.push({
        id: 'first-course-complete',
        title: 'Course Conqueror',
        description: 'Completed your first course!',
        icon: '🎓',
        earnedAt: coursesWithProgress.find(c => c.certificateEarned)?.enrolledAt || new Date().toISOString(),
        type: 'COURSE_COMPLETE' as const
      });
    }

    if (totalQuizzesPassed >= 10) {
      achievements.push({
        id: 'quiz-master',
        title: 'Quiz Master',
        description: 'Passed 10 quizzes!',
        icon: '🧠',
        earnedAt: new Date().toISOString(),
        type: 'QUIZ_MASTER' as const
      });
    }

    if (currentStreak >= 7) {
      achievements.push({
        id: 'week-streak',
        title: 'Week Warrior',
        description: 'Maintained a 7-day learning streak!',
        icon: '🔥',
        earnedAt: new Date().toISOString(),
        type: 'STREAK' as const
      });
    }

    if (totalCompletedLessons > 0) {
      achievements.push({
        id: 'first-lesson',
        title: 'Getting Started',
        description: 'Completed your first lesson!',
        icon: '🌟',
        earnedAt: recentLessonCompletions[0]?.completedAt?.toISOString() || new Date().toISOString(),
        type: 'FIRST_LESSON' as const
      });
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        avatar: user.imageUrl,
        joinedAt: user.createdAt.toISOString()
      },
      courses: coursesWithProgress,
      achievements,
      upcomingItems,
      stats: {
        totalCoursesEnrolled: enrollments.length,
        coursesCompleted: coursesWithProgress.filter(c => c.certificateEarned).length,
        totalLearningTime,
        currentStreak,
        totalQuizzesPassed,
        totalAssignmentsSubmitted,
        averageScore: Math.round(avgQuizScore._avg.percentage || 0)
      },
      recentActivity: recentActivityItems
    });

  } catch (error) {
    console.error('Error loading student dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
