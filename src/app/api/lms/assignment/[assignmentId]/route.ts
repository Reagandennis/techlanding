import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: {
    assignmentId: string;
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

    const { assignmentId } = params;

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

    // Get assignment with course and lesson info
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
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
        }
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    let hasAccess = false;

    // Instructor has access to their own assignments
    if (user.role === 'INSTRUCTOR' && assignment.course?.instructorId === user.id) {
      hasAccess = true;
    } else {
      // Students need enrollment or free lesson access
      if (assignment.courseId) {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: assignment.courseId
            }
          }
        });

        if (enrollment) {
          hasAccess = true;
        } else if (assignment.lesson?.isFree) {
          hasAccess = true;
        }
      } else if (assignment.lesson?.isFree) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. Please enroll in the course or check if this is a free lesson.' },
        { status: 403 }
      );
    }

    // Get user's submission if exists
    let submission = null;
    if (user.role === 'STUDENT') {
      submission = await prisma.assignmentSubmission.findUnique({
        where: {
          userId_assignmentId: {
            userId: user.id,
            assignmentId: assignmentId
          }
        },
        include: {
          files: true,
          gradedBy: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      if (submission) {
        submission = {
          ...submission,
          files: submission.files.map(file => ({
            id: file.id,
            filename: file.filename,
            fileUrl: file.fileUrl,
            fileSize: file.fileSize,
            fileType: file.fileType
          }))
        };
      }
    }

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        dueDate: assignment.dueDate,
        maxPoints: assignment.maxPoints,
        submissionType: assignment.submissionType,
        allowedFileTypes: assignment.allowedFileTypes || [],
        maxFileSize: assignment.maxFileSize || 10000000, // 10MB default
        maxFiles: assignment.maxFiles || 5,
        isGraded: assignment.isGraded,
        courseId: assignment.courseId,
        lessonId: assignment.lessonId,
        course: assignment.course ? {
          id: assignment.course.id,
          title: assignment.course.title
        } : null,
        lesson: assignment.lesson ? {
          id: assignment.lesson.id,
          title: assignment.lesson.title
        } : null
      },
      submission
    });

  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    );
  }
}