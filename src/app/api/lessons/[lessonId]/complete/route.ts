import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId } = await req.json();
    
    if (!courseId) {
      return new NextResponse("Course ID is required", { status: 400 });
    }

    // Verify the lesson exists and belongs to the course
    const lesson = await db.lesson.findUnique({
      where: {
        id: params.lessonId,
      },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    if (lesson.module.course.id !== courseId) {
      return new NextResponse("Lesson does not belong to this course", { status: 400 });
    }

    // Check if user is enrolled in the course
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
    });

    if (!enrollment) {
      return new NextResponse("Not enrolled in this course", { status: 403 });
    }

    // Create or update user progress
    const userProgress = await db.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: userId,
          lessonId: params.lessonId,
        },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
        timeSpent: 0, // You can track actual time spent if needed
      },
      create: {
        userId: userId,
        lessonId: params.lessonId,
        isCompleted: true,
        completedAt: new Date(),
        timeSpent: 0,
      },
    });

    // Update enrollment progress
    const totalLessons = await db.lesson.count({
      where: {
        module: {
          courseId: courseId,
        },
      },
    });

    const completedLessons = await db.userProgress.count({
      where: {
        userId: userId,
        lesson: {
          module: {
            courseId: courseId,
          },
        },
        isCompleted: true,
      },
    });

    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

    await db.enrollment.update({
      where: {
        id: enrollment.id,
      },
      data: {
        progress: progressPercentage,
        lastAccessedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      progress: userProgress,
      courseProgress: progressPercentage,
      completedLessons,
      totalLessons,
    });
  } catch (error) {
    console.error("[LESSON_COMPLETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId } = await req.json();
    
    if (!courseId) {
      return new NextResponse("Course ID is required", { status: 400 });
    }

    // Verify the lesson exists and belongs to the course
    const lesson = await db.lesson.findUnique({
      where: {
        id: params.lessonId,
      },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    if (lesson.module.course.id !== courseId) {
      return new NextResponse("Lesson does not belong to this course", { status: 400 });
    }

    // Check if user is enrolled in the course
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
    });

    if (!enrollment) {
      return new NextResponse("Not enrolled in this course", { status: 403 });
    }

    // Mark as incomplete
    await db.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: userId,
          lessonId: params.lessonId,
        },
      },
      update: {
        isCompleted: false,
        completedAt: null,
      },
      create: {
        userId: userId,
        lessonId: params.lessonId,
        isCompleted: false,
        timeSpent: 0,
      },
    });

    // Update enrollment progress
    const totalLessons = await db.lesson.count({
      where: {
        module: {
          courseId: courseId,
        },
      },
    });

    const completedLessons = await db.userProgress.count({
      where: {
        userId: userId,
        lesson: {
          module: {
            courseId: courseId,
          },
        },
        isCompleted: true,
      },
    });

    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

    await db.enrollment.update({
      where: {
        id: enrollment.id,
      },
      data: {
        progress: progressPercentage,
        lastAccessedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      courseProgress: progressPercentage,
      completedLessons,
      totalLessons,
    });
  } catch (error) {
    console.error("[LESSON_INCOMPLETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}