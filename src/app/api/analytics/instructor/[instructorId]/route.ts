import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/analytics';
import { PerformanceMonitor } from '@/lib/performance';

export async function GET(
  request: Request,
  { params }: { params: { instructorId: string } }
) {
  const timer = PerformanceMonitor.startTimer('analytics-instructor-api');
  
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { instructorId } = params;
    
    // Check if user is requesting their own analytics or if they're admin
    // TODO: Implement proper role checking
    // For now, we'll allow users to only access their own data
    if (userId !== instructorId) {
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

    const metrics = await AnalyticsService.getInstructorMetrics(instructorId, dateRange);
    
    timer(); // End timing
    
    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    timer(); // End timing even on error
    console.error('Instructor analytics error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch instructor analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}