import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

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
      select: { id: true, role: true, email: true, name: true }
    });

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can enroll in courses' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { courseId, successUrl, cancelUrl } = body;

    if (!courseId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Course ID, success URL, and cancel URL are required' },
        { status: 400 }
      );
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        thumbnailUrl: true,
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

    // Check if course is free
    const isFree = !course.price || course.price === 0;
    if (isFree) {
      return NextResponse.json(
        { error: 'Free courses should use direct enrollment' },
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

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.description || 'Online course',
              images: course.thumbnailUrl ? [course.thumbnailUrl] : undefined,
            },
            unit_amount: course.price, // Price should be in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        courseId: courseId,
        userId: user.id,
        userClerkId: userId,
      },
      // Enable automatic tax calculation if needed
      // automatic_tax: { enabled: true },
    });

    // Store the payment intent for tracking
    await prisma.paymentIntent.create({
      data: {
        stripeSessionId: session.id,
        userId: user.id,
        courseId: courseId,
        amount: course.price,
        currency: 'usd',
        status: 'PENDING',
        createdAt: new Date()
      }
    }).catch((error) => {
      // If payment intent creation fails, log but don't fail the request
      console.warn('Failed to create payment intent record:', error);
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error creating payment session:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Payment error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}

// Handle Stripe webhook for successful payments
export async function PUT(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const { courseId, userId } = session.metadata || {};

      if (!courseId || !userId) {
        console.error('Missing metadata in webhook:', session.metadata);
        return NextResponse.json(
          { error: 'Invalid metadata' },
          { status: 400 }
        );
      }

      // Create enrollment
      await prisma.enrollment.create({
        data: {
          userId: userId,
          courseId: courseId,
          enrolledAt: new Date(),
          status: 'ACTIVE',
          paymentStatus: 'COMPLETED',
          stripeSessionId: session.id
        }
      });

      // Update payment intent status
      await prisma.paymentIntent.updateMany({
        where: {
          stripeSessionId: session.id
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      }).catch(() => {
        // Ignore if payment intent update fails
      });

      // Get course title for activity log
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true }
      });

      // Create activity log
      await prisma.activityLog.create({
        data: {
          userId: userId,
          action: 'COURSE_ENROLLED',
          entityType: 'COURSE',
          entityId: courseId,
          details: `Enrolled in course: ${course?.title || 'Unknown Course'} (Paid)`
        }
      }).catch(() => {
        // Ignore if activity log fails
      });

      console.log(`Successfully enrolled user ${userId} in course ${courseId}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}