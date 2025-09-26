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
    const { voteType } = body;

    if (!voteType || !['HELPFUL', 'UNHELPFUL'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
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

    // Check if user is trying to vote on their own review
    if (review.userId === user.id) {
      return NextResponse.json(
        { error: 'You cannot vote on your own review' },
        { status: 400 }
      );
    }

    // Check if user has already voted
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        userId_reviewId: {
          userId: user.id,
          reviewId: reviewId
        }
      }
    });

    let helpfulChange = 0;
    let unhelpfulChange = 0;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // User is removing their vote
        await prisma.reviewVote.delete({
          where: {
            userId_reviewId: {
              userId: user.id,
              reviewId: reviewId
            }
          }
        });

        // Update counters
        if (voteType === 'HELPFUL') {
          helpfulChange = -1;
        } else {
          unhelpfulChange = -1;
        }
      } else {
        // User is changing their vote
        await prisma.reviewVote.update({
          where: {
            userId_reviewId: {
              userId: user.id,
              reviewId: reviewId
            }
          },
          data: { voteType }
        });

        // Update counters
        if (voteType === 'HELPFUL') {
          helpfulChange = 1;
          unhelpfulChange = -1;
        } else {
          helpfulChange = -1;
          unhelpfulChange = 1;
        }
      }
    } else {
      // User is voting for the first time
      await prisma.reviewVote.create({
        data: {
          userId: user.id,
          reviewId: reviewId,
          voteType: voteType
        }
      });

      // Update counters
      if (voteType === 'HELPFUL') {
        helpfulChange = 1;
      } else {
        unhelpfulChange = 1;
      }
    }

    // Update review counters
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: helpfulChange
        },
        unhelpfulCount: {
          increment: unhelpfulChange
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Vote recorded successfully'
    });

  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}