'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SectionHeading from '../../components/SectionHeading';
import { 
  Users, 
  BookOpen, 
  Award, 
  Settings, 
  BarChart3,
  ShieldCheck,
  Database,
  Activity
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalCertificates: number;
  totalRevenue: number;
  activeUsers: number;
}

interface RecentUser {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalCertificates: 0,
    totalRevenue: 0,
    activeUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in');
        return;
      }
      
      fetchAdminStats();
    }
  }, [user, isLoaded, router]);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/lms/admin/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }
      const data = await response.json();
      setStats(data.stats);
      setRecentUsers(data.users);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <SectionHeading
            eyebrow="Admin Dashboard"
            title="System Overview"
            description="Manage users, courses, and monitor platform performance"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-6 w-6 text-blue-500 mr-3" />
                <span className="font-medium">Manage Users</span>
              </button>

              <button
                onClick={() => router.push('/admin/users/roles')}
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-6 w-6 text-blue-500 mr-3" />
                <span className="font-medium">Manage User Roles</span>
              </button>

              <button
                onClick={() => router.push('/admin/courses')}
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BookOpen className="h-6 w-6 text-green-500 mr-3" />
                <span className="font-medium">Manage Courses</span>
              </button>

              <button
                onClick={() => router.push('/admin/analytics')}
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="h-6 w-6 text-purple-500 mr-3" />
                <span className="font-medium">Analytics</span>
              </button>

              <button
                onClick={() => router.push('/admin/settings')}
                className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-6 w-6 text-gray-500 mr-3" />
                <span className="font-medium">System Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Platform Activity</h2>
            <div className="space-y-4">
              {recentUsers.map((userItem) => (
                <div key={userItem.id} className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    <span className="text-gray-900">New {userItem.role.toLowerCase()} registration: {userItem.name || userItem.email}</span>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(userItem.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}