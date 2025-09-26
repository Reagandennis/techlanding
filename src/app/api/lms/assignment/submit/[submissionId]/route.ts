import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: {
    submissionId: string;
  };
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { submissionId } = params;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can update submissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { textContent, files } = body;

    // Get existing submission
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            course: true,
            lesson: true
          }
        },
        files: true
      }
    });

    if (!existingSubmission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check if user owns this submission
    if (existingSubmission.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own submissions' },
        { status: 403 }
      );
    }

    // Check if submission is already graded
    if (existingSubmission.status === 'GRADED') {
      return NextResponse.json(
        { error: 'Cannot update a graded submission' },
        { status: 400 }
      );
    }

    const assignment = existingSubmission.assignment;

    // Check if assignment is past due (allow update if already submitted before due date)
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate) && 
        existingSubmission.status !== 'SUBMITTED') {
      return NextResponse.json(
        { error: 'Assignment is past due and cannot be updated' },
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

    // Update submission
    const updatedSubmission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        textContent: textContent?.trim() || null,
        submittedAt: new Date(), // Update submission time
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

    // Delete existing files and create new ones
    if (files && files.length > 0) {
      // Delete old files
      await prisma.submissionFile.deleteMany({
        where: { submissionId: submissionId }
      });

      // Create new files
      const fileRecords = files.map((file: any) => ({
        submissionId: submissionId,
        filename: file.filename,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize,
        fileType: file.fileType
      }));

      await prisma.submissionFile.createMany({
        data: fileRecords
      });

      // Fetch updated submission with new files
      const finalSubmission = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
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
        message: 'Submission updated successfully!',
        submission: {
          ...finalSubmission,
          files: finalSubmission?.files.map(file => ({
            id: file.id,
            filename: file.filename,
            fileUrl: file.fileUrl,
            fileSize: file.fileSize,
            fileType: file.fileType
          }))
        }
      });
    } else {
      // If no files provided, remove existing files
      await prisma.submissionFile.deleteMany({
        where: { submissionId: submissionId }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Submission updated successfully!',
      submission: {
        ...updatedSubmission,
        files: []
      }
    });

  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}