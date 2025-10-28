import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: {
    reviewId: string;
  };
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reviewId } = params;

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

    // Get review
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check permissions - only review owner or admin can delete
    if (review.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    // Delete review and related data
    await prisma.$transaction([
      // Delete votes first (foreign key constraint)
      prisma.reviewVote.deleteMany({
        where: { reviewId: reviewId }
      }),
      // Delete reports
      prisma.reviewReport.deleteMany({
        where: { reviewId: reviewId }
      }),
      // Delete the review
      prisma.review.delete({
        where: { id: reviewId }
      })
    ]);

    // Update course rating cache
    await updateCourseRating(review.courseId);

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}

// Helper function to update course rating
async function updateCourseRating(courseId: string) {
  try {
    const stats = await prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await prisma.course.update({
      where: { id: courseId },
      data: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating || 0
      }
    });
  } catch (error) {
    console.error('Error updating course rating:', error);
  }
}
