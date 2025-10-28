import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AnalyticsService } from '@/lib/analytics';
import { SecurityUtils } from '@/lib/security';
import { z } from 'zod';

// Validation schema for activity tracking
const ActivitySchema = z.object({
  action: z.string().min(1).max(50),
  resourceType: z.enum(['course', 'lesson', 'quiz', 'video', 'assignment', 'certificate']),
  resourceId: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional()
});

const BatchActivitySchema = z.object({
  activities: z.array(ActivitySchema).min(1).max(50) // Limit batch size
});

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    let activities: any[];
    
    if (Array.isArray(body.activities)) {
      // Batch tracking
      const result = BatchActivitySchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({
          error: 'Invalid request body',
          details: result.error.errors
        }, { status: 400 });
      }
      activities = result.data.activities;
    } else {
      // Single activity tracking
      const result = ActivitySchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({
          error: 'Invalid request body',
          details: result.error.errors
        }, { status: 400 });
      }
      activities = [result.data];
    }

    // Sanitize and process activities
    const processedActivities = activities.map(activity => ({
      ...activity,
      action: SecurityUtils.sanitizeInput(activity.action),
      resourceId: SecurityUtils.sanitizeInput(activity.resourceId),
      metadata: activity.metadata ? JSON.parse(JSON.stringify(activity.metadata)) : undefined
    }));

    // Track activities
    const trackingPromises = processedActivities.map(activity =>
      AnalyticsService.trackUserActivity(userId, activity)
    );
    
    await Promise.all(trackingPromises);

    // Update daily analytics if lesson completion or video watch
    const hasLearningActivity = processedActivities.some(activity => 
      activity.action === 'lesson_completed' || activity.action === 'video_watched'
    );
    
    if (hasLearningActivity) {
      // Update user's daily analytics in background
      AnalyticsService.updateDailyAnalytics(userId).catch(error => {
        console.error('Failed to update daily analytics:', error);
      });
    }

    return NextResponse.json({
      success: true,
      tracked: processedActivities.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Activity tracking error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to track activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Get activity history for a user (optional endpoint)
export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get('resourceType');
    const resourceId = searchParams.get('resourceId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // This would query your activity log table
    // For now, we'll return a placeholder response
    const activities = [
      {
        id: '1',
        action: 'lesson_completed',
        resourceType: 'lesson',
        resourceId: 'lesson-123',
        timestamp: new Date().toISOString(),
        metadata: {}
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        activities,
        total: activities.length,
        limit,
        offset
      }
    });

  } catch (error) {
    console.error('Activity history error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch activity history',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}