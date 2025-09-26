import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import InstructorDashboard from '@/components/analytics/InstructorDashboard';
import { AnalyticsService } from '@/lib/analytics';

export default async function InstructorAnalyticsPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // TODO: Add role check to ensure user is an instructor
  // For now, we'll use userId as instructorId
  
  let initialData;
  try {
    // Pre-load initial analytics data on the server
    initialData = await AnalyticsService.getInstructorMetrics(userId);
  } catch (error) {
    console.error('Failed to load initial analytics data:', error);
    // Component will handle loading state if no initial data
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <InstructorDashboard 
        instructorId={userId} 
        initialData={initialData}
      />
    </div>
  );
}