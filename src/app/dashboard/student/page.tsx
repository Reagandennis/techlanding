import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import StudentDashboard from '@/components/lms/StudentDashboard';
import { prisma } from '@/lib/prisma';

export default async function StudentDashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get user to check role
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true }
  });

  if (!user || user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentDashboard />
      </div>
    </div>
  );
}