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

    const { 
      currentTime, 
      duration, 
      timeSpent, 
      courseId,
      watchPercentage 
    } = await req.json();
    
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

    // Determine if lesson should be marked as completed
    // Consider completed if watched 90% or more
    const isCompleted = watchPercentage >= 90;

    // Update user progress
    const userProgress = await db.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: userId,
          lessonId: params.lessonId,
        },
      },
      update: {
        currentTime: currentTime,
        timeSpent: timeSpent,
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
        watchPercentage: watchPercentage,
      },
      create: {
        userId: userId,
        lessonId: params.lessonId,
        currentTime: currentTime,
        timeSpent: timeSpent,
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
        watchPercentage: watchPercentage,
      },
    });

    // If lesson was just completed, update enrollment progress
    if (isCompleted) {
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
    }

    return NextResponse.json({
      success: true,
      progress: userProgress,
      lessonCompleted: isCompleted,
    });
  } catch (error) {
    console.error("[VIDEO_PROGRESS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user progress for this lesson
    const userProgress = await db.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: userId,
          lessonId: params.lessonId,
        },
      },
    });

    return NextResponse.json({
      progress: userProgress || {
        currentTime: 0,
        timeSpent: 0,
        isCompleted: false,
        watchPercentage: 0,
      },
    });
  } catch (error) {
    console.error("[GET_VIDEO_PROGRESS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}