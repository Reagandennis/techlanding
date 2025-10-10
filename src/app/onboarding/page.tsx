import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import RoleSelection from '@/components/RoleSelection';

export default async function OnboardingPage() {
  const { userId } = auth();
  
  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <RoleSelection />
        </Suspense>
      </div>
    </div>
  );
}