import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: {
    quizId: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { quizId } = params;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get quiz with questions and check access
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructorId: true
          }
        },
        lesson: {
          select: {
            id: true,
            title: true,
            isFree: true,
            courseId: true
          }
        },
        questions: {
          select: {
            id: true,
            questionText: true,
            type: true,
            options: true,
            points: true,
            explanation: true,
            // Don't include correctAnswer for students
            ...(user.role === 'INSTRUCTOR' && { correctAnswer: true })
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    let hasAccess = false;

    // Instructor has access to their own quizzes
    if (user.role === 'INSTRUCTOR' && quiz.course?.instructorId === user.id) {
      hasAccess = true;
    } else {
      // Students need enrollment or free lesson access
      if (quiz.courseId) {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: quiz.courseId
            }
          }
        });

        if (enrollment) {
          hasAccess = true;
        } else if (quiz.lesson?.isFree) {
          hasAccess = true;
        }
      } else if (quiz.lesson?.isFree) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. Please enroll in the course or check if this is a free lesson.' },
        { status: 403 }
      );
    }

    // Get user's attempt count
    const attemptCount = await prisma.quizAttempt.count({
      where: {
        userId: user.id,
        quizId: quizId
      }
    });

    // Get user's best attempt
    const bestAttempt = await prisma.quizAttempt.findFirst({
      where: {
        userId: user.id,
        quizId: quizId
      },
      orderBy: {
        percentage: 'desc'
      },
      select: {
        score: true,
        percentage: true,
        isPassed: true,
        completedAt: true
      }
    });

    // Check if user can take another attempt
    const canRetake = attemptCount < quiz.maxAttempts;

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        instructions: quiz.instructions,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        timeLimit: quiz.timeLimit,
        isRandomized: quiz.isRandomized,
        showResults: quiz.showResults,
        showCorrectAnswers: quiz.showCorrectAnswers,
        courseId: quiz.courseId,
        lessonId: quiz.lessonId,
        course: quiz.course ? {
          id: quiz.course.id,
          title: quiz.course.title
        } : null,
        lesson: quiz.lesson ? {
          id: quiz.lesson.id,
          title: quiz.lesson.title
        } : null,
        questions: quiz.questions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          type: q.type,
          options: q.options,
          points: q.points,
          explanation: quiz.showCorrectAnswers ? q.explanation : null,
          ...(user.role === 'INSTRUCTOR' && { correctAnswer: q.correctAnswer })
        })),
        totalQuestions: quiz.questions.length,
        totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0)
      },
      userProgress: {
        attemptCount,
        canRetake,
        bestAttempt,
        remainingAttempts: quiz.maxAttempts - attemptCount
      }
    });

  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}