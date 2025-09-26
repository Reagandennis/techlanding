import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { notificationService } from '@/lib/notifications';

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

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can enroll in courses' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { courseId, paymentMethod } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        isPublished: true
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (!course.isPublished) {
      return NextResponse.json(
        { error: 'Course is not available for enrollment' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Validate payment method for paid courses
    const isFree = !course.price || course.price === 0;
    
    if (!isFree && paymentMethod === 'FREE') {
      return NextResponse.json(
        { error: 'This course requires payment' },
        { status: 400 }
      );
    }

    if (isFree && paymentMethod !== 'FREE') {
      return NextResponse.json(
        { error: 'Invalid payment method for free course' },
        { status: 400 }
      );
    }

    // For free courses, create enrollment immediately
    if (isFree) {
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: courseId,
          enrolledAt: new Date(),
          status: 'ACTIVE',
          paymentStatus: 'FREE'
        },
        include: {
          course: {
            select: {
              title: true
            }
          }
        }
      });

      // Create activity log
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'COURSE_ENROLLED',
          entityType: 'COURSE',
          entityId: courseId,
          details: `Enrolled in course: ${course.title}`
        }
      }).catch(() => {
        // Ignore if activity log fails
      });

      // Send enrollment notification
      await notificationService.notifyEnrollment(
        user.id,
        course.title,
        'Your Instructor', // You might want to fetch the actual instructor name
        `/courses/${courseId}`
      ).catch(() => {
        // Ignore if notification fails
      });

      return NextResponse.json({
        success: true,
        enrollment: {
          id: enrollment.id,
          courseId: enrollment.courseId,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          courseName: enrollment.course.title
        },
        message: 'Successfully enrolled in course!'
      });
    }

    // For paid courses, this endpoint shouldn't be used directly
    // Instead, use the payment endpoint which will create enrollment after successful payment
    return NextResponse.json(
      { error: 'Paid courses must use payment flow' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}