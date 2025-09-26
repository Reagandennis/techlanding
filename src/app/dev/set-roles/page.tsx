'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SetRolesPage() {
  const { user, isLoaded } = useUser();
  const [targetClerkId, setTargetClerkId] = useState('');
  const [role, setRole] = useState('INSTRUCTOR');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSetRole = async () => {
    if (!targetClerkId) {
      setMessage('Please enter a Clerk User ID');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/dev/setup-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetClerkId,
          role,
          name: name || undefined,
          email: email || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Success: ${data.message}`);
        // Clear form
        setTargetClerkId('');
        setName('');
        setEmail('');
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetMyRole = () => {
    if (user) {
      setTargetClerkId(user.id);
      setName(user.fullName || '');
      setEmail(user.emailAddresses[0]?.emailAddress || '');
    }
  };

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Loading...</span>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🛠️ Setup User Roles (Development)
          </h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>⚠️ Development Tool:</strong> This page is for setting up user roles during development. 
              Remove this from production builds.
            </p>
          </div>

          {user && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Your Information:</h3>
              <p className="text-blue-800 text-sm">
                <strong>Clerk ID:</strong> <code className="bg-blue-100 px-1 rounded">{user.id}</code><br/>
                <strong>Name:</strong> {user.fullName}<br/>
                <strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}
              </p>
              <Button 
                onClick={handleSetMyRole} 
                size="sm" 
                variant="outline" 
                className="mt-3"
              >
                Use My Info
              </Button>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clerk User ID *
              </label>
              <input
                type="text"
                value={targetClerkId}
                onChange={(e) => setTargetClerkId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="user_2ABC123XYZ"
              />
              <p className="text-xs text-gray-500 mt-1">
                Find this in Clerk Dashboard or browser dev tools when logged in as that user
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="STUDENT">👨‍🎓 Student</option>
                <option value="INSTRUCTOR">👨‍🏫 Instructor</option>
                <option value="ADMIN">👑 Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="user@example.com"
              />
            </div>

            <Button
              onClick={handleSetRole}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Setting Role...' : 'Set Role'}
            </Button>

            {message && (
              <div className={`p-3 rounded-lg ${
                message.startsWith('✅') 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">🚀 Quick Access URLs:</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>👨‍🎓 Student Dashboard:</strong> 
                <a href="/dashboard/student" className="text-blue-600 hover:underline ml-2">/dashboard/student</a>
              </p>
              <p>
                <strong>👨‍🏫 Instructor Dashboard:</strong> 
                <a href="/lms/instructor" className="text-blue-600 hover:underline ml-2">/lms/instructor</a>
              </p>
              <p>
                <strong>👑 Admin Analytics:</strong> 
                <a href="/admin/analytics" className="text-blue-600 hover:underline ml-2">/admin/analytics</a>
              </p>
              <p>
                <strong>📊 Instructor Analytics:</strong> 
                <a href="/instructor/analytics" className="text-blue-600 hover:underline ml-2">/instructor/analytics</a>
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">📋 Setup Instructions:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Create a new account (or use existing) by signing up via Clerk</li>
              <li>2. Copy the Clerk User ID from this page or dev tools</li>
              <li>3. Select the desired role (INSTRUCTOR or ADMIN)</li>
              <li>4. Click "Set Role" to update the user's permissions</li>
              <li>5. Visit the appropriate dashboard URL to test the role</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}