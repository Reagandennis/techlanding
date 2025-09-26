import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/analytics';
import { PerformanceMonitor } from '@/lib/performance';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const timer = PerformanceMonitor.startTimer('analytics-course-api');
  
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = params;
    
    // Check if user is the course instructor or admin
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true }
    });
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    // TODO: Add admin role check here
    if (course.instructorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    let dateRange;
    if (from && to) {
      dateRange = {
        from: new Date(from),
        to: new Date(to)
      };
    }

    const metrics = await AnalyticsService.getCourseMetrics(courseId, dateRange);
    
    timer(); // End timing
    
    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    timer(); // End timing even on error
    console.error('Course analytics error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch course analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}