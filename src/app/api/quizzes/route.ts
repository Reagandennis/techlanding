import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      title,
      description,
      moduleId,
      timeLimit,
      passingScore,
      maxAttempts,
      showResultsImmediately,
      randomizeQuestions,
      questions,
    } = await req.json();

    // Check if user has permission to create quiz in this module
    const module = await db.module.findUnique({
      where: {
        id: moduleId,
      },
      include: {
        course: true,
      },
    });

    if (!module) {
      return new NextResponse("Module not found", { status: 404 });
    }

    // Check if user is instructor of the course
    if (module.course.instructorId !== userId) {
      return new NextResponse("You don't have permission to create quizzes in this course", { status: 403 });
    }

    // Create quiz with questions
    const quiz = await db.quiz.create({
      data: {
        title,
        description,
        moduleId,
        timeLimit,
        passingScore,
        maxAttempts,
        showResultsImmediately,
        randomizeQuestions,
        questions: {
          create: questions.map((q: any, index: number) => ({
            question: q.question,
            type: q.type,
            order: index + 1,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points || 1,
          })),
        },
      },
      include: {
        questions: true,
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[QUIZ_CREATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    const courseId = searchParams.get("courseId");

    let where: any = {};

    if (moduleId) {
      where.moduleId = moduleId;
    } else if (courseId) {
      where.module = {
        courseId: courseId,
      };
    }

    const quizzes = await db.quiz.findMany({
      where,
      include: {
        questions: true,
        module: {
          include: {
            course: true,
          },
        },
        attempts: {
          where: {
            userId: userId,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("[QUIZ_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}