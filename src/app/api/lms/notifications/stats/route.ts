import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
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
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get notification statistics
    const [total, unread, byType, byPriority] = await Promise.all([
      // Total count
      prisma.notification.count({
        where: { userId: user.id }
      }),
      
      // Unread count
      prisma.notification.count({
        where: { userId: user.id, isRead: false }
      }),
      
      // Group by type
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId: user.id },
        _count: { type: true }
      }),
      
      // Group by priority
      prisma.notification.groupBy({
        by: ['priority'],
        where: { userId: user.id },
        _count: { priority: true }
      })
    ]);

    // Format the grouped results
    const byTypeFormatted = byType.reduce((acc, item) => {
      acc[item.type] = item._count.type;
      return acc;
    }, {} as Record<string, number>);

    const byPriorityFormatted = byPriority.reduce((acc, item) => {
      acc[item.priority] = item._count.priority;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      total,
      unread,
      byType: byTypeFormatted,
      byPriority: byPriorityFormatted
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification statistics' },
      { status: 500 }
    );
  }
}