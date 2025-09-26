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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const unreadOnly = searchParams.get('unread') === 'true';

    // Build where clause
    const where: any = {
      userId: user.id,
      ...(type && { type }),
      ...(category && { category }),
      ...(unreadOnly && { isRead: false })
    };

    // Get notifications with pagination
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    return NextResponse.json({
      notifications: notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
        actionUrl: notification.actionUrl,
        metadata: notification.metadata,
        priority: notification.priority,
        category: notification.category
      })),
      hasMore: notifications.length === limit
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

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

    if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only instructors and admins can create notifications' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { 
      recipientIds, 
      type, 
      title, 
      message, 
      actionUrl, 
      metadata, 
      priority, 
      category,
      sendEmail 
    } = body;

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return NextResponse.json(
        { error: 'Recipient IDs are required' },
        { status: 400 }
      );
    }

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Type, title, and message are required' },
        { status: 400 }
      );
    }

    // Create notifications for all recipients
    const notifications = recipientIds.map((recipientId: string) => ({
      userId: recipientId,
      type: type,
      title: title,
      message: message,
      actionUrl: actionUrl || null,
      metadata: metadata || {},
      priority: priority || 'MEDIUM',
      category: category || 'SYSTEM',
      isRead: false,
      createdAt: new Date()
    }));

    await prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true
    });

    return NextResponse.json({
      success: true,
      message: `${recipientIds.length} notifications sent successfully`,
      count: recipientIds.length
    });

  } catch (error) {
    console.error('Error creating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to create notifications' },
      { status: 500 }
    );
  }
}