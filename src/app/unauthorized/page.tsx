'use client';

import { useRoleAccess } from '@/hooks/useRoleAccess';
import Link from 'next/link';

export default function UnauthorizedPage() {
  const { userRole, isLoaded } = useRoleAccess({ requiredRole: 'student' });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'instructor':
        return '/instructor/dashboard';
      case 'student':
      default:
        return '/student/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-2">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Your current role: <span className="font-semibold capitalize">{userRole}</span>
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href={getDashboardLink()}
            className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Your Dashboard
          </Link>
          
          <Link
            href="/"
            className="inline-block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Need different access?</h3>
          <p className="text-sm text-blue-700">
            Contact your administrator or check if you need to update your role in your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}