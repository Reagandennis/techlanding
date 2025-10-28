import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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
      select: { id: true, role: true }
    });

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can submit assignments' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { assignmentId, courseId, lessonId, textContent, files } = body;

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    // Get assignment and verify access
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            id: true,
            instructorId: true
          }
        },
        lesson: {
          select: {
            id: true,
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

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. Please enroll in the course or check if this is a free lesson.' },
        { status: 403 }
      );
    }

    // Check if assignment is past due
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      return NextResponse.json(
        { error: 'Assignment is past due' },
        { status: 400 }
      );
    }

    // Validate submission type requirements
    if (assignment.submissionType === 'TEXT' && (!textContent || !textContent.trim())) {
      return NextResponse.json(
        { error: 'Text content is required for this assignment' },
        { status: 400 }
      );
    }

    if (assignment.submissionType === 'FILE' && (!files || files.length === 0)) {
      return NextResponse.json(
        { error: 'At least one file is required for this assignment' },
        { status: 400 }
      );
    }

    if (assignment.submissionType === 'BOTH' && (!textContent || !textContent.trim()) && (!files || files.length === 0)) {
      return NextResponse.json(
        { error: 'Either text content or file is required for this assignment' },
        { status: 400 }
      );
    }

    // Check if submission already exists
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        userId_assignmentId: {
          userId: user.id,
          assignmentId: assignmentId
        }
      }
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Assignment already submitted. Use update endpoint to modify.' },
        { status: 400 }
      );
    }

    // Determine submission status
    const isLate = assignment.dueDate ? new Date() > new Date(assignment.dueDate) : false;
    const status = isLate ? 'LATE' : 'SUBMITTED';

    // Create submission
    const submission = await prisma.assignmentSubmission.create({
      data: {
        userId: user.id,
        assignmentId: assignmentId,
        textContent: textContent?.trim() || null,
        submittedAt: new Date(),
        status: status
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

    // Create file records if any
    if (files && files.length > 0) {
      const fileRecords = files.map((file: any) => ({
        submissionId: submission.id,
        filename: file.filename,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize,
        fileType: file.fileType
      }));

      await prisma.submissionFile.createMany({
        data: fileRecords
      });

      // Fetch the submission with files
      const updatedSubmission = await prisma.assignmentSubmission.findUnique({
        where: { id: submission.id },
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

      return NextResponse.json({
        success: true,
        message: 'Assignment submitted successfully!',
        submission: {
          ...updatedSubmission,
          files: updatedSubmission?.files.map(file => ({
            id: file.id,
            filename: file.filename,
            fileUrl: file.fileUrl,
            fileSize: file.fileSize,
            fileType: file.fileType
          }))
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment submitted successfully!',
      submission: {
        ...submission,
        files: []
      }
    });

  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json(
      { error: 'Failed to submit assignment' },
      { status: 500 }
    );
  }
}