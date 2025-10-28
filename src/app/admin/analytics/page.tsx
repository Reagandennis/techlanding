import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/analytics/AdminDashboard';
import { AnalyticsService } from '@/lib/analytics';

export default async function AdminAnalyticsPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // TODO: Add role check to ensure user is an admin
  // For now, we'll allow access to authenticated users
  
  let initialData;
  try {
    // Pre-load initial analytics data on the server
    initialData = await AnalyticsService.getPlatformMetrics();
  } catch (error) {
    console.error('Failed to load initial analytics data:', error);
    // Component will handle loading state if no initial data
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminDashboard initialData={initialData} />
    </div>
  );
}