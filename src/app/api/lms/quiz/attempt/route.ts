import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { notificationService } from '@/lib/notifications';

export async function POST(req: NextRequest) {
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
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { quizId, courseId, lessonId, attempt } = body;

    if (!quizId || !attempt) {
      return NextResponse.json(
        { error: 'Quiz ID and attempt data are required' },
        { status: 400 }
      );
    }

    // Verify user has access to the quiz
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: true,
        lesson: true
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Check if user is enrolled or if it's a free lesson
    if (courseId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: courseId
          }
        }
      });

      if (!enrollment) {
        // Check if lesson is free
        if (lessonId) {
          const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { isFree: true }
          });

          if (!lesson?.isFree) {
            return NextResponse.json(
              { error: 'Access denied. Please enroll in the course.' },
              { status: 403 }
            );
          }
        } else {
          return NextResponse.json(
            { error: 'Access denied. Please enroll in the course.' },
            { status: 403 }
          );
        }
      }
    }

    // Check if user has exceeded max attempts
    const existingAttempts = await prisma.quizAttempt.count({
      where: {
        userId: user.id,
        quizId: quizId
      }
    });

    if (existingAttempts >= quiz.maxAttempts) {
      return NextResponse.json(
        { error: 'Maximum attempts exceeded' },
        { status: 400 }
      );
    }

    // Create quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizId: quizId,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        startedAt: new Date(attempt.startedAt),
        completedAt: attempt.completedAt ? new Date(attempt.completedAt) : null,
        timeSpent: attempt.timeSpent || null,
        status: attempt.status,
        submittedAt: new Date(),
        feedback: attempt.isPassed ? 'Great job! You passed the quiz.' : 'Keep studying and try again.',
      }
    });

    // Create question answers
    const answers = Object.entries(attempt.answers).map(([questionId, answer]) => ({
      questionId,
      attemptId: quizAttempt.id,
      answer: answer as string,
      isCorrect: false, // We'll calculate this
      pointsEarned: 0,
    }));

    // Calculate correct answers and points
    if (answers.length > 0) {
      const questions = await prisma.question.findMany({
        where: {
          id: { in: answers.map(a => a.questionId) },
          quizId: quizId
        }
      });

      const questionsMap = questions.reduce((map, q) => {
        map[q.id] = q;
        return map;
      }, {} as { [key: string]: any });

      // Update answers with correct/incorrect status
      const updatedAnswers = answers.map(answer => {
        const question = questionsMap[answer.questionId];
        if (!question) return answer;

        let isCorrect = false;
        
        if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
          isCorrect = answer.answer === question.correctAnswer;
        } else if (question.type === 'SHORT_ANSWER') {
          const correctAnswer = question.correctAnswer?.toLowerCase().trim();
          const userAnswer = answer.answer?.toLowerCase().trim();
          isCorrect = correctAnswer === userAnswer;
        }
        // Essay questions need manual grading

        return {
          ...answer,
          isCorrect,
          pointsEarned: isCorrect ? question.points : 0,
        };
      });

      // Create question answers in database
      await prisma.questionAnswer.createMany({
        data: updatedAnswers
      });
    }

    // If this is a lesson quiz and passed, mark lesson as complete
    if (lessonId && attempt.isPassed) {
      await prisma.progress.upsert({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: lessonId
          }
        },
        create: {
          userId: user.id,
          lessonId: lessonId,
          courseId: courseId,
          isCompleted: true,
          completedAt: new Date(),
        },
        update: {
          isCompleted: true,
          completedAt: new Date(),
        }
      });
    }

    // Send quiz graded notification
    await notificationService.notifyQuizGraded(
      user.id,
      quiz.title,
      attempt.percentage,
      quiz.course?.title || 'Course',
      `/quiz/${quizId}/results`
    ).catch(() => {
      // Ignore if notification fails
    });

    return NextResponse.json({
      success: true,
      id: quizAttempt.id,
      score: quizAttempt.score,
      percentage: quizAttempt.percentage,
      isPassed: quizAttempt.isPassed,
      message: quizAttempt.isPassed ? 'Congratulations! You passed the quiz.' : 'Keep studying and try again.'
    });

  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz attempt' },
      { status: 500 }
    );
  }
}

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
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('quizId');

    if (!quizId) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      );
    }

    // Get quiz attempts for user
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.id,
        quizId: quizId
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                questionText: true,
                type: true,
                correctAnswer: true,
                points: true,
                explanation: true
              }
            }
          }
        }
      },
      orderBy: {
        attemptNumber: 'desc'
      }
    });

    return NextResponse.json({
      attempts: attempts.map(attempt => ({
        id: attempt.id,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        timeSpent: attempt.timeSpent,
        status: attempt.status,
        submittedAt: attempt.submittedAt,
        feedback: attempt.feedback,
        answers: attempt.answers.reduce((acc, answer) => {
          acc[answer.questionId] = answer.answer;
          return acc;
        }, {} as { [key: string]: string })
      }))
    });

  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz attempts' },
      { status: 500 }
    );
  }
}