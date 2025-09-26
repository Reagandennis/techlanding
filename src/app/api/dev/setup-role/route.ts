import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// TEMPORARY ENDPOINT FOR INITIAL SETUP - REMOVE IN PRODUCTION
export async function POST(request: NextRequest) {
  try {
    // WARNING: This endpoint bypasses all authentication for initial setup
    // DELETE this file in production
    
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

    console.log(`✅ Role setup: User ${targetClerkId} set to ${role}`);

    return NextResponse.json({ 
      success: true,
      user,
      message: `User role set to ${role} successfully`,
      warning: 'This endpoint bypasses authentication - DELETE in production'
    });

  } catch (error) {
    console.error('Error setting user role:', error);
    return NextResponse.json(
      { error: 'Failed to set user role', details: error.message },
      { status: 500 }
    );
  }
}

// Also provide GET endpoint for testing
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const clerkId = url.searchParams.get('clerkId');

    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId }
      });

      return NextResponse.json({ 
        user: user || null,
        message: user ? 'User found' : 'User not found in database'
      });
    }

    // Return all users for debugging
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      users,
      count: users.length,
      message: 'All users retrieved'
    });

  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json(
      { error: 'Failed to get users', details: error.message },
      { status: 500 }
    );
  }
}