import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: {
    courseId: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { userId } = auth();
    const { courseId } = params;
    const { searchParams } = new URL(req.url);
    
    const rating = searchParams.get('rating');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get user if authenticated
    let currentUser = null;
    if (userId) {
      currentUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, role: true }
      });
    }

    // Build where clause
    const where: any = {
      courseId: courseId,
      ...(rating && rating !== 'all' && { rating: parseInt(rating) })
    };

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'helpful':
        orderBy = { helpfulCount: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      default: // newest
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Get reviews with pagination
    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true
          }
        },
        votes: currentUser ? {
          where: {
            userId: currentUser.id
          },
          select: {
            voteType: true
          }
        } : false
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    });

    // Format reviews with user permissions
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      reviewText: review.reviewText,
      isAnonymous: review.isAnonymous,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      helpfulCount: review.helpfulCount,
      unhelpfulCount: review.unhelpfulCount,
      isReported: review.isReported,
      user: {
        name: review.user.name,
        imageUrl: review.user.imageUrl
      },
      userVote: currentUser && review.votes?.[0]?.voteType || null,
      canEdit: currentUser?.id === review.userId,
      canDelete: currentUser?.id === review.userId || currentUser?.role === 'ADMIN',
      canReport: currentUser && currentUser.id !== review.userId
    }));

    return NextResponse.json({
      reviews: formattedReviews,
      hasMore: reviews.length === limit
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
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

    const { courseId } = params;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only enrolled students can review courses' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { rating, reviewText, isAnonymous } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You must be enrolled in this course to review it' },
        { status: 403 }
      );
    }

    // Check if user has already reviewed this course
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this course' },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        courseId: courseId,
        rating: rating,
        reviewText: reviewText?.trim() || null,
        isAnonymous: isAnonymous || false,
        helpfulCount: 0,
        unhelpfulCount: 0,
        isReported: false
      }
    });

    // Update course rating cache (you might want to do this in a background job)
    await updateCourseRating(courseId);

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        reviewText: review.reviewText,
        createdAt: review.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
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

    const { courseId } = params;

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
    const { reviewId, rating, reviewText, isAnonymous } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if review exists and user owns it
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    if (existingReview.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own reviews' },
        { status: 403 }
      );
    }

    if (existingReview.courseId !== courseId) {
      return NextResponse.json(
        { error: 'Review does not belong to this course' },
        { status: 400 }
      );
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: rating,
        reviewText: reviewText?.trim() || null,
        isAnonymous: isAnonymous || false,
        updatedAt: new Date()
      }
    });

    // Update course rating cache
    await updateCourseRating(courseId);

    return NextResponse.json({
      success: true,
      review: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        reviewText: updatedReview.reviewText,
        updatedAt: updatedReview.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
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