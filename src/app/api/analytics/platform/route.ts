import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/analytics';
import { PerformanceMonitor } from '@/lib/performance';

export async function GET(request: Request) {
  const timer = PerformanceMonitor.startTimer('analytics-platform-api');
  
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    // TODO: Implement proper role checking from your user system
    // For now, we'll assume any authenticated user can access this
    
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

    const metrics = await AnalyticsService.getPlatformMetrics(dateRange);
    
    timer(); // End timing
    
    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    timer(); // End timing even on error
    console.error('Platform analytics error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch platform analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}