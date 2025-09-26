import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: {
    reviewId: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteContext) {
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
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Report reason is required' },
        { status: 400 }
      );
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user is trying to report their own review
    if (review.userId === user.id) {
      return NextResponse.json(
        { error: 'You cannot report your own review' },
        { status: 400 }
      );
    }

    // Check if user has already reported this review
    const existingReport = await prisma.reviewReport.findUnique({
      where: {
        userId_reviewId: {
          userId: user.id,
          reviewId: reviewId
        }
      }
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this review' },
        { status: 400 }
      );
    }

    // Create report
    await prisma.reviewReport.create({
      data: {
        userId: user.id,
        reviewId: reviewId,
        reason: reason.trim(),
        status: 'PENDING'
      }
    });

    // Mark review as reported
    await prisma.review.update({
      where: { id: reviewId },
      data: { isReported: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Review reported successfully. We will review it shortly.'
    });

  } catch (error) {
    console.error('Error reporting review:', error);
    return NextResponse.json(
      { error: 'Failed to report review' },
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