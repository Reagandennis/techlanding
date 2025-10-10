import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const updateUserRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.nativeEnum(UserRole),
  reason: z.string().optional(),
});

const getUsersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().optional(),
});

// GET - Fetch users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true }
    });

    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      role: searchParams.get('role') as UserRole || undefined,
      search: searchParams.get('search') || undefined,
    };

    const validatedParams = getUsersSchema.parse(queryParams);
    const { page, limit, role, search } = validatedParams;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deletedAt: null, // Only active users
    };

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get users and total count
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          clerkId: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          lastActivityDate: true,
          _count: {
            select: {
              enrollments: true,
              createdCourses: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Get role distribution
    const roleStats = await prisma.user.groupBy({
      by: ['role'],
      where: { deletedAt: null },
      _count: { role: true },
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        roleStats: roleStats.reduce((acc, stat) => {
          acc[stat.role] = stat._count.role;
          return acc;
        }, {} as Record<UserRole, number>),
      },
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update user role
export async function PUT(request: NextRequest) {
  try {
    const { userId: currentUserId } = auth();
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: currentUserId },
      select: { role: true, id: true, name: true }
    });

    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateUserRoleSchema.parse(body);
    const { userId, role, reason } = validatedData;

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, clerkId: true, name: true, email: true, role: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admins from demoting themselves
    if (targetUser.clerkId === currentUserId && role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'You cannot change your own admin role' },
        { status: 400 }
      );
    }

    const oldRole = targetUser.role;

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      }
    });

    // Log the role change (you could also store this in a separate audit log table)
    console.log(`🔄 Role change: ${currentUser.name} changed ${targetUser.name} (${targetUser.email}) from ${oldRole} to ${role}. Reason: ${reason || 'No reason provided'}`);

    // TODO: Send notification to the user about role change
    // await sendRoleChangeNotification(targetUser.email, oldRole, role);

    return NextResponse.json({
      success: true,
      message: `User role updated from ${oldRole} to ${role}`,
      data: updatedUser,
      changes: {
        oldRole,
        newRole: role,
        changedBy: currentUser.name,
        reason: reason || null,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update user role', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Bulk operations (bulk role updates, etc.)
export async function POST(request: NextRequest) {
  try {
    const { userId: currentUserId } = auth();
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: currentUserId },
      select: { role: true, id: true, name: true }
    });

    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, userIds, role, reason } = body;

    if (action === 'bulk_update_role') {
      if (!Array.isArray(userIds) || !role || !Object.values(UserRole).includes(role)) {
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
      }

      // Prevent bulk updating admin users (safety measure)
      const targetUsers = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, clerkId: true, name: true, email: true, role: true }
      });

      const adminUsers = targetUsers.filter(user => user.role === UserRole.ADMIN);
      if (adminUsers.length > 0) {
        return NextResponse.json(
          { error: 'Cannot bulk update admin users for security reasons' },
          { status: 400 }
        );
      }

      // Perform bulk update
      const result = await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { role }
      });

      console.log(`🔄 Bulk role change: ${currentUser.name} updated ${result.count} users to ${role}. Reason: ${reason || 'No reason provided'}`);

      return NextResponse.json({
        success: true,
        message: `Updated ${result.count} users to ${role}`,
        data: { updatedCount: result.count, targetRole: role }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: 'Bulk operation failed', details: error.message },
      { status: 500 }
    );
  }
}