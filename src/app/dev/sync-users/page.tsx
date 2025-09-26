'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function SyncUsersPage() {
  const { userId, isLoaded } = useAuth();
  const [comparison, setComparison] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('comparison');

  const checkUserSync = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/sync-existing-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setComparison(result);
      setActiveTab('comparison');
    } catch (error) {
      setComparison({ error: 'Failed to check sync status', details: error.message });
    } finally {
      setLoading(false);
    }
  };

  const syncAllUsers = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/sync-existing-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setSyncResult(result);
      setActiveTab('sync');
      
      // Refresh comparison after sync
      setTimeout(() => checkUserSync(), 1000);
    } catch (error) {
      setSyncResult({ error: 'Failed to sync users', details: error.message });
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
        <p>Please sign in to access user sync tools.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">User Synchronization Tool</h1>
      <p className="text-gray-600 mb-6">
        This tool helps sync existing Clerk users to your database. Your webhook only captures new events, 
        so existing users need to be manually synced.
      </p>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={checkUserSync}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Sync Status'}
        </button>
        
        <button
          onClick={syncAllUsers}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Syncing...' : 'Sync All Users'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'comparison'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sync Status
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sync'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sync Results
          </button>
        </nav>
      </div>

      {/* Comparison Tab */}
      {activeTab === 'comparison' && comparison && (
        <div className="space-y-6">
          {comparison.error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h2 className="font-semibold text-red-800">Error</h2>
              <p className="text-red-700">{comparison.error}</p>
              {comparison.details && (
                <pre className="mt-2 text-xs text-red-600">{comparison.details}</pre>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <h3 className="font-semibold text-blue-800">Clerk Users</h3>
                  <p className="text-2xl font-bold text-blue-600">{comparison.comparison?.clerk.total || 0}</p>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <h3 className="font-semibold text-green-800">Database Users</h3>
                  <p className="text-2xl font-bold text-green-600">{comparison.comparison?.database.total || 0}</p>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <h3 className="font-semibold text-yellow-800">Missing from DB</h3>
                  <p className="text-2xl font-bold text-yellow-600">{comparison.comparison?.missing.length || 0}</p>
                </div>
              </div>

              {comparison.comparison?.missing.length > 0 && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-4 text-yellow-800">Users Not Synced to Database</h3>
                  <div className="overflow-auto max-h-64">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Clerk ID</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.comparison.missing.map((user, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-mono text-xs">{user.id}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {comparison.comparison?.missing.length === 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <h3 className="font-semibold text-green-800">✅ All users are synced!</h3>
                  <p className="text-green-700">All Clerk users are properly synced to the database.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Sync Results Tab */}
      {activeTab === 'sync' && syncResult && (
        <div className="space-y-6">
          {syncResult.error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h2 className="font-semibold text-red-800">Sync Error</h2>
              <p className="text-red-700">{syncResult.error}</p>
              {syncResult.details && (
                <pre className="mt-2 text-xs text-red-600">{syncResult.details}</pre>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <h3 className="font-semibold text-blue-800">Total Processed</h3>
                  <p className="text-2xl font-bold text-blue-600">{syncResult.results?.total || 0}</p>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <h3 className="font-semibold text-green-800">Successfully Synced</h3>
                  <p className="text-2xl font-bold text-green-600">{syncResult.results?.synced || 0}</p>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                  <h3 className="font-semibold text-purple-800">New Users</h3>
                  <p className="text-2xl font-bold text-purple-600">{syncResult.results?.created || 0}</p>
                </div>
                
                <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                  <h3 className="font-semibold text-orange-800">Updated Users</h3>
                  <p className="text-2xl font-bold text-orange-600">{syncResult.results?.updated || 0}</p>
                </div>
              </div>

              {syncResult.results?.users && syncResult.results.users.length > 0 && (
                <div className="p-4 border rounded">
                  <h3 className="font-semibold mb-4">Synced Users</h3>
                  <div className="overflow-auto max-h-64">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Role</th>
                          <th className="text-left p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {syncResult.results.users.map((user, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.name}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                user.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                user.isNewUser ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.isNewUser ? 'Created' : 'Updated'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {syncResult.results?.errors && syncResult.results.errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <h3 className="font-semibold text-red-800 mb-2">Errors</h3>
                  {syncResult.results.errors.map((error, index) => (
                    <p key={index} className="text-red-700 text-sm">{error}</p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="font-semibold text-red-800">⚠️ Development Tool</h3>
        <p className="text-red-700">
          This is a one-time setup tool. After syncing your existing users, the webhook will automatically 
          handle new users. Remove this page and API endpoint before deploying to production.
        </p>
      </div>
    </div>
  );
}