import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only allow existing admins to set roles (or remove this check for initial setup)
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    // Remove this check for initial admin setup
    if (currentUser && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can set user roles' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetClerkId, role, name, email } = body;

    if (!targetClerkId || !role) {
      return NextResponse.json(
        { error: 'targetClerkId and role are required' },
        { status: 400 }
      );
    }

    if (!['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be STUDENT, INSTRUCTOR, or ADMIN' },
        { status: 400 }
      );
    }

    // Create or update user with role
    const user = await prisma.user.upsert({
      where: {
        clerkId: targetClerkId
      },
      update: {
        role: role,
        ...(name && { name }),
        ...(email && { email })
      },
      create: {
        clerkId: targetClerkId,
        name: name || 'User',
        email: email || `${targetClerkId}@example.com`,
        role: role
      }
    });

    return NextResponse.json({ 
      success: true,
      user,
      message: `User role set to ${role} successfully` 
    });

  } catch (error) {
    console.error('Error setting user role:', error);
    return NextResponse.json(
      { error: 'Failed to set user role' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user's role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    return NextResponse.json({ 
      user: user || { clerkId: userId, role: 'STUDENT' }
    });

  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json(
      { error: 'Failed to get user role' },
      { status: 500 }
    );
  }
}
