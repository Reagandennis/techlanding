import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find or create user in our database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        enrollments: {
          include: {
            course: true
          }
        },
        certificates: true,
        userBadges: {
          include: {
            badge: true
          }
        }
      }
    });

    // Create user if doesn't exist
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: `${user.firstName} ${user.lastName}`.trim() || user.username || 'User',
          image: user.imageUrl,
          role: 'STUDENT' // Default role for new users
        },
        include: {
          enrollments: {
            include: {
              course: true
            }
          },
          certificates: true,
          userBadges: {
            include: {
              badge: true
            }
          }
        }
      });
    }

    return NextResponse.json({
      user: dbUser,
      role: dbUser.role,
      clerkUser: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress,
        imageUrl: user.imageUrl
      }
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { role, bio } = body;

    // Only allow admins to change roles
    const currentDbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!currentDbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If trying to change role, check if user is admin
    if (role && role !== currentDbUser.role && currentDbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        ...(role && { role }),
        ...(bio && { bio }),
      }
    });

    return NextResponse.json({ user: updatedUser });
    
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
