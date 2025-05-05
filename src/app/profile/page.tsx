'use client';

import useAuth from '../hooks/useAuth';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    redirect('/api/auth/login');
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {user?.picture && (
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <Image 
                src={user.picture} 
                alt={user.name || 'Profile picture'} 
                width={96} 
                height={96}
                className="object-cover"
              />
            </div>
          )}
          
          <div>
            <h2 className="text-2xl font-semibold">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Account Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}</p>
                <p><span className="font-medium">User ID:</span> {user?.sub}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}