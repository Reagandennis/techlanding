import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, accessCode } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Find or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: `${user.firstName} ${user.lastName}`.trim() || user.username || 'User',
          image: user.imageUrl,
          role: 'STUDENT'
        }
      });
    }

    // Find the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            name: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Course is not available' }, { status: 400 });
    }

    // Check if course requires access code
    if (course.accessCode && (!accessCode || accessCode !== course.accessCode)) {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 400 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: dbUser.id,
          courseId: courseId
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: dbUser.id,
        courseId: courseId,
        status: 'ACTIVE',
        paymentStatus: course.price === 0 ? 'PAID' : 'PENDING'
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            thumbnail: true
          }
        }
      }
    });

    return NextResponse.json({ 
      enrollment,
      message: course.price === 0 
        ? 'Successfully enrolled in course!' 
        : 'Enrollment created. Please complete payment to access course content.',
      requiresPayment: course.price > 0
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
