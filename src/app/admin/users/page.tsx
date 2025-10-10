'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import { useRoleAccess, UserRole, withRoleAccess } from '@/hooks/useRoleAccess';

interface User {
  id: string;
  clerkId: string;
  name: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityDate: string | null;
  _count: {
    enrollments: number;
    createdCourses: number;
  };
}

interface UserData {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  roleStats: Record<UserRole, number>;
}

const UserRoleManager = () => {
  const { isLoaded, userId } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | ''>('');
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkRole, setBulkRole] = useState<UserRole>(UserRole.STUDENT);
  const [bulkReason, setBulkReason] = useState('');

  const roles = Object.values(UserRole);
  const roleColors = {
    [UserRole.ADMIN]: 'bg-red-100 text-red-800 border-red-200',
    [UserRole.INSTRUCTOR]: 'bg-blue-100 text-blue-800 border-blue-200',
    [UserRole.STUDENT]: 'bg-green-100 text-green-800 border-green-200',
    [UserRole.USER]: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const fetchUsers = async (page = 1, search = '', role = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(role && { role }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();
      setUserData(result.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole, reason?: string) => {
    try {
      setIsUpdatingRole(userId);
      
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole, reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user role');
      }

      const result = await response.json();
      toast.success(result.message);
      
      // Refresh the users list
      await fetchUsers(currentPage, searchTerm, filterRole);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error(error.message || 'Failed to update user role');
    } finally {
      setIsUpdatingRole(null);
    }
  };

  const bulkUpdateRoles = async () => {
    if (selectedUsers.size === 0) {
      toast.error('Please select users to update');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_update_role',
          userIds: Array.from(selectedUsers),
          role: bulkRole,
          reason: bulkReason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Bulk update failed');
      }

      const result = await response.json();
      toast.success(result.message);
      
      setSelectedUsers(new Set());
      setShowBulkModal(false);
      setBulkReason('');
      
      // Refresh the users list
      await fetchUsers(currentPage, searchTerm, filterRole);
    } catch (error) {
      console.error('Error in bulk update:', error);
      toast.error(error.message || 'Bulk update failed');
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === userData?.users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(userData?.users.map(user => user.id) || []));
    }
  };

  useEffect(() => {
    if (isLoaded && userId) {
      fetchUsers();
    }
  }, [isLoaded, userId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, searchTerm, filterRole);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterRole]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load user data</p>
          <button 
            onClick={() => fetchUsers()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
          
          {/* Role Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {Object.entries(userData.roleStats).map(([role, count]) => (
              <div key={role} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${roleColors[role as UserRole]}`}>
                  {role}
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <select
                id="role-filter"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as UserRole | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              {selectedUsers.size > 0 && (
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Bulk Update ({selectedUsers.size})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Users</h2>
              <div className="text-sm text-gray-600">
                Showing {userData.users.length} of {userData.pagination.totalCount} users
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === userData.users.length && userData.users.length > 0}
                      onChange={selectAllUsers}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userData.users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.image && (
                          <img
                            className="h-10 w-10 rounded-full mr-3"
                            src={user.image}
                            alt={user.name || 'User'}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${roleColors[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Enrollments: {user._count.enrollments}</div>
                      <div>Courses: {user._count.createdCourses}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={user.role}
                        onChange={(e) => {
                          const newRole = e.target.value as UserRole;
                          if (newRole !== user.role) {
                            const reason = prompt(`Changing ${user.name || user.email} from ${user.role} to ${newRole}. Reason (optional):`);
                            updateUserRole(user.id, newRole, reason || undefined);
                          }
                        }}
                        disabled={isUpdatingRole === user.id}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                      {isUpdatingRole === user.id && (
                        <div className="inline-block ml-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {userData.pagination.totalPages > 1 && (
            <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => {
                    setCurrentPage(currentPage - 1);
                    fetchUsers(currentPage - 1, searchTerm, filterRole);
                  }}
                  disabled={!userData.pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    setCurrentPage(currentPage + 1);
                    fetchUsers(currentPage + 1, searchTerm, filterRole);
                  }}
                  disabled={!userData.pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{userData.pagination.page}</span> of{' '}
                    <span className="font-medium">{userData.pagination.totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => {
                        setCurrentPage(currentPage - 1);
                        fetchUsers(currentPage - 1, searchTerm, filterRole);
                      }}
                      disabled={!userData.pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage(currentPage + 1);
                        fetchUsers(currentPage + 1, searchTerm, filterRole);
                      }}
                      disabled={!userData.pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Update Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">Bulk Update User Roles</h3>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Update {selectedUsers.size} selected users to:
                  </p>
                  <select
                    value={bulkRole}
                    onChange={(e) => setBulkRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Reason for bulk update (optional)"
                    value={bulkReason}
                    onChange={(e) => setBulkReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowBulkModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={bulkUpdateRoles}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Update Roles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRoleManager;