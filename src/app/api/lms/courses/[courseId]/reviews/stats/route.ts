import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: {
    courseId: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { courseId } = params;

    // Get overall stats
    const overallStats = await prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { courseId },
      _count: { rating: true }
    });

    // Format rating distribution
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    ratingDistribution.forEach(group => {
      distribution[group.rating as keyof typeof distribution] = group._count.rating;
    });

    const stats = {
      averageRating: Number(overallStats._avg.rating?.toFixed(1)) || 0,
      totalReviews: overallStats._count.rating || 0,
      ratingDistribution: distribution
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review statistics' },
      { status: 500 }
    );
  }
}