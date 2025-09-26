import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import StudentDashboard from '@/components/analytics/StudentDashboard';
import { AnalyticsService } from '@/lib/analytics';

export default async function StudentAnalyticsPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  let initialData;
  try {
    // Pre-load initial analytics data on the server
    initialData = await AnalyticsService.getStudentMetrics(userId);
  } catch (error) {
    console.error('Failed to load initial analytics data:', error);
    // Component will handle loading state if no initial data
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <StudentDashboard 
        studentId={userId} 
        initialData={initialData}
      />
    </div>
  );
}