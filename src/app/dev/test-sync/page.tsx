'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function TestSyncPage() {
  const { userId, isLoaded } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSyncTest = async (method: 'GET' | 'POST') => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/dev/test-sync', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: 'Failed to run test', details: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!userId) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Not Authenticated</h1>
        <p>Please sign in to test user sync functionality.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">User Sync Test Page</h1>
      <p className="text-gray-600 mb-6">
        This page tests the automatic user synchronization between Clerk and the database.
      </p>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="font-semibold text-blue-800">Current User Info</h2>
        <p><strong>Clerk User ID:</strong> {userId}</p>
      </div>

      <div className="space-y-4 mb-8">
        <button
          onClick={() => runSyncTest('GET')}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mr-4"
        >
          {loading ? 'Testing...' : 'Test User Sync (GET)'}
        </button>
        
        <button
          onClick={() => runSyncTest('POST')}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Force Sync (POST)'}
        </button>
      </div>

      {testResult && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="font-semibold mb-4">Test Result</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800">How to Use</h3>
        <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
          <li><strong>Test User Sync (GET):</strong> Checks if current user is synced and shows recent users</li>
          <li><strong>Force Sync (POST):</strong> Forces a fresh synchronization of the current user</li>
          <li>The sync process should automatically detect roles based on email patterns</li>
          <li>Check the console for detailed sync logs</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="font-semibold text-red-800">⚠️ Development Only</h3>
        <p className="text-red-700">
          This is a development tool. Remove this page and the test API endpoint before deploying to production.
        </p>
      </div>
    </div>
  );
}