'use client';

import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

export default function ApiTestPage() {
  const { userId, getToken, isLoaded } = useAuth();
  const { user } = useUser();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testAuthEndpoint = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Get the session token for authenticated requests
      const token = await getToken();
      
      const response = await fetch('/api/dev/auth-test', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setResults(prev => ({ ...prev, authTest: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, authTest: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  const testSyncEndpoint = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const token = await getToken();
      
      const response = await fetch('/api/dev/test-sync', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setResults(prev => ({ ...prev, syncTest: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, syncTest: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  const testDirectDbConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dev/db-test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setResults(prev => ({ ...prev, dbTest: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, dbTest: { error: error.message } }));
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
        <p>Please sign in to test API endpoints.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="font-semibold text-blue-800">Client-Side Auth Info</h2>
        <p><strong>User ID:</strong> {userId}</p>
        <p><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}</p>
        <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
      </div>

      <div className="space-x-4 mb-8">
        <button
          onClick={testAuthEndpoint}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Auth Endpoint
        </button>
        
        <button
          onClick={testSyncEndpoint}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Sync Endpoint
        </button>
        
        <button
          onClick={testDirectDbConnection}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test DB Connection
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="space-y-6">
          {Object.entries(results).map(([key, value]) => (
            <div key={key} className="p-4 border rounded">
              <h3 className="font-semibold mb-2 capitalize">{key} Result</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800">Debug Instructions</h3>
        <ol className="list-decimal list-inside text-yellow-700 mt-2 space-y-1">
          <li>Click "Test Auth Endpoint" first to verify server-side auth works</li>
          <li>Check your terminal/console for detailed logs</li>
          <li>If auth test works but sync test fails, we know it's a sync-specific issue</li>
          <li>Check if database connection works independently</li>
        </ol>
      </div>
    </div>
  );
}