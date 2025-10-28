import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Start a new quiz attempt
export async function POST(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const quiz = await db.quiz.findUnique({
      where: {
        id: params.quizId,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
        module: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: {
                    userId: userId,
                  },
                },
              },
            },
          },
        },
        attempts: {
          where: {
            userId: userId,
          },
        },
      },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // Check if user is enrolled in the course
    if (quiz.module.course.enrollments.length === 0) {
      return new NextResponse("You must be enrolled in this course to take the quiz", { status: 403 });
    }

    // Check if user has exceeded max attempts
    if (quiz.maxAttempts && quiz.attempts.length >= quiz.maxAttempts) {
      return new NextResponse("You have exceeded the maximum number of attempts for this quiz", { status: 400 });
    }

    // Check if there's an active attempt
    const activeAttempt = quiz.attempts.find(attempt => !attempt.submittedAt);
    if (activeAttempt) {
      // Return existing attempt if within time limit
      const timeElapsed = Date.now() - activeAttempt.startedAt.getTime();
      if (!quiz.timeLimit || timeElapsed < quiz.timeLimit * 60 * 1000) {
        return NextResponse.json({
          attempt: activeAttempt,
          questions: quiz.randomizeQuestions 
            ? shuffleArray([...quiz.questions])
            : quiz.questions,
          timeRemaining: quiz.timeLimit 
            ? Math.max(0, (quiz.timeLimit * 60 * 1000) - timeElapsed)
            : null,
        });
      } else {
        // Auto-submit expired attempt
        await db.quizAttempt.update({
          where: { id: activeAttempt.id },
          data: {
            submittedAt: new Date(),
            score: 0,
            passed: false,
            timeSpent: quiz.timeLimit * 60,
          },
        });
      }
    }

    // Create new attempt
    const attempt = await db.quizAttempt.create({
      data: {
        quizId: params.quizId,
        userId: userId,
        startedAt: new Date(),
        answers: JSON.stringify({}),
      },
    });

    // Return quiz questions (randomized if needed)
    const questions = quiz.randomizeQuestions 
      ? shuffleArray([...quiz.questions])
      : quiz.questions;

    return NextResponse.json({
      attempt,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        order: q.order,
        options: q.options ? JSON.parse(q.options) : null,
        points: q.points,
        // Don't send correct answer or explanation during attempt
      })),
      timeRemaining: quiz.timeLimit ? quiz.timeLimit * 60 * 1000 : null,
    });
  } catch (error) {
    console.error("[QUIZ_ATTEMPT_START_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Submit quiz attempt
export async function PUT(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { attemptId, answers } = await req.json();

    if (!attemptId || !answers) {
      return new NextResponse("Attempt ID and answers are required", { status: 400 });
    }

    const attempt = await db.quizAttempt.findUnique({
      where: {
        id: attemptId,
        userId: userId,
      },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      return new NextResponse("Quiz attempt not found", { status: 404 });
    }

    if (attempt.submittedAt) {
      return new NextResponse("Quiz attempt already submitted", { status: 400 });
    }

    // Check time limit
    const timeElapsed = Date.now() - attempt.startedAt.getTime();
    const timeSpentSeconds = Math.floor(timeElapsed / 1000);

    if (attempt.quiz.timeLimit && timeElapsed > attempt.quiz.timeLimit * 60 * 1000) {
      return new NextResponse("Time limit exceeded", { status: 400 });
    }

    // Grade the quiz
    const { score, totalPoints, correctAnswers, results } = gradeQuiz(attempt.quiz.questions, answers);
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= attempt.quiz.passingScore;

    // Update attempt with results
    const submittedAttempt = await db.quizAttempt.update({
      where: { id: attemptId },
      data: {
        answers: JSON.stringify(answers),
        submittedAt: new Date(),
        score: percentage,
        passed,
        timeSpent: timeSpentSeconds,
      },
    });

    return NextResponse.json({
      attempt: submittedAttempt,
      results: attempt.quiz.showResultsImmediately ? {
        score: percentage,
        passed,
        correctAnswers,
        totalQuestions: attempt.quiz.questions.length,
        timeSpent: timeSpentSeconds,
        details: results,
      } : {
        score: percentage,
        passed,
        totalQuestions: attempt.quiz.questions.length,
        timeSpent: timeSpentSeconds,
      },
    });
  } catch (error) {
    console.error("[QUIZ_ATTEMPT_SUBMIT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Get quiz attempt details
export async function GET(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const attemptId = searchParams.get("attemptId");

    if (attemptId) {
      // Get specific attempt
      const attempt = await db.quizAttempt.findUnique({
        where: {
          id: attemptId,
          userId: userId,
        },
        include: {
          quiz: {
            include: {
              questions: true,
            },
          },
        },
      });

      if (!attempt) {
        return new NextResponse("Quiz attempt not found", { status: 404 });
      }

      return NextResponse.json(attempt);
    } else {
      // Get all attempts for this quiz by user
      const attempts = await db.quizAttempt.findMany({
        where: {
          quizId: params.quizId,
          userId: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(attempts);
    }
  } catch (error) {
    console.error("[QUIZ_ATTEMPT_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Helper functions
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function gradeQuiz(questions: any[], answers: Record<string, any>) {
  let score = 0;
  let totalPoints = 0;
  let correctAnswers = 0;
  const results: any[] = [];

  questions.forEach(question => {
    totalPoints += question.points;
    const userAnswer = answers[question.id];
    let isCorrect = false;

    switch (question.type) {
      case 'MULTIPLE_CHOICE':
      case 'TRUE_FALSE':
        isCorrect = userAnswer === question.correctAnswer;
        break;
      case 'MULTIPLE_SELECT':
        const correctOptions = JSON.parse(question.correctAnswer);
        const userOptions = userAnswer || [];
        isCorrect = arraysEqual(userOptions.sort(), correctOptions.sort());
        break;
      case 'SHORT_ANSWER':
        // Simple string comparison (could be enhanced with fuzzy matching)
        isCorrect = userAnswer?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        break;
    }

    if (isCorrect) {
      score += question.points;
      correctAnswers++;
    }

    results.push({
      questionId: question.id,
      question: question.question,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      points: question.points,
      explanation: question.explanation,
    });
  });

  return { score, totalPoints, correctAnswers, results };
}

function arraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((val, index) => val === arr2[index]);
}