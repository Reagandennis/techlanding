import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/analytics';
import { PerformanceMonitor } from '@/lib/performance';

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  const timer = PerformanceMonitor.startTimer('analytics-student-api');
  
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId } = params;
    
    // Check if user is requesting their own analytics or if they're admin
    // TODO: Implement proper role checking
    // For now, we'll allow users to only access their own data
    if (userId !== studentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const metrics = await AnalyticsService.getStudentMetrics(studentId);
    
    timer(); // End timing
    
    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    timer(); // End timing even on error
    console.error('Student analytics error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch student analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}