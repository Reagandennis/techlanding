
'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function LMSPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        // Redirect to sign in if not authenticated
        router.push('/sign-in')
        return
      }

      if (user) {
        // Automatically assign STUDENT role and then redirect
        const assignRole = async () => {
          try {
            const response = await fetch('/api/lms/assign-student-role', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              console.log('User role assigned to STUDENT or already is STUDENT.');
              router.push('/lms/student');
            } else {
              const errorData = await response.json();
              console.error('Failed to assign student role:', errorData.message);
              // Optionally, redirect to an error page or show a message
              // For now, we'll still try to redirect to student dashboard
              router.push('/lms/student');
            }
          } catch (error) {
            console.error('Error assigning student role:', error);
            // For now, we'll still try to redirect to student dashboard
            router.push('/lms/student');
          }
        };
        assignRole();
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to LMS...</p>
      </div>
    </div>
  )
}

