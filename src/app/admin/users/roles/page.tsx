'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import SectionHeading from '../../../../components/SectionHeading';

export default function AdminSetUserRolePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { userRole: currentUserRole, loading: userRoleLoading } = useUserRole();
  const router = useRouter();

  const [targetClerkId, setTargetClerkId] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isLoaded || userRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn || currentUserRole !== UserRole.ADMIN) {
    router.push('/admin'); // Redirect non-admins or unauthenticated users
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetClerkId, role: selectedRole }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'User role updated successfully!' });
        setTargetClerkId(''); // Clear form
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update user role.' });
      }
    } catch (error) {
      console.error('Error setting user role:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeading
          eyebrow="Admin Tools"
          title="Manage User Roles"
          description="Assign or update roles for any user in the system."
        />

        <div className="bg-white rounded-lg shadow p-8 mt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="clerkId" className="block text-sm font-medium text-gray-700 mb-1">
                User Clerk ID
              </label>
              <input
                type="text"
                id="clerkId"
                value={targetClerkId}
                onChange={(e) => setTargetClerkId(e.target.value)}
                placeholder="Enter Clerk User ID (e.g., user_2N3Y4Z5X6W7V8U9T)"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Assign Role
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              >
                {Object.values(UserRole).map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !targetClerkId}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Updating Role...' : 'Update User Role'}
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-md flex items-center space-x-2 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}