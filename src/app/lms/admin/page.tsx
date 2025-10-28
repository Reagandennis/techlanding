'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserRole } from '@prisma/client'
import LMSProtectedRoute from '@/components/LMSProtectedRoute'
import LMSLayout from '@/components/lms/LMSLayout'
import { 
  WelcomeCard, 
  StatsCard, 
  QuickActions 
} from '@/components/lms/DashboardWidgets'
import { Users, BookOpen, TrendingUp, Shield, UserPlus, Settings, Edit, Trash2, FileText, BarChart3, Calendar } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalCourses: number
  totalRevenue: number
  activeUsers: number
}

interface UserData {
  id: string
  clerkId: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

export default function AdminDashboard() {
  const { user } = useUser()
  const [userRole, setUserRole] = useState<UserRole>(UserRole.USER)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeUsers: 0
  })
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('')
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/lms/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setUsers(data.users)
        setUserRole(data.userRole)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch('/api/lms/admin/users/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole })
      })

      if (response.ok) {
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ))
        setShowRoleModal(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const openRoleModal = (userData: UserData) => {
    setSelectedUser(userData)
    setSelectedRole(userData.role)
    setShowRoleModal(true)
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800'
      case UserRole.INSTRUCTOR:
        return 'bg-blue-100 text-blue-800'
      case UserRole.STUDENT:
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and edit user roles',
      href: '/lms/admin/users',
      icon: Users,
      color: 'blue' as const
    },
    {
      title: 'Course Management',
      description: 'Manage all courses',
      href: '/lms/admin/courses',
      icon: BookOpen,
      color: 'green' as const
    },
    {
      title: 'Reports & Analytics',
      description: 'View platform analytics',
      href: '/lms/admin/reports',
      icon: BarChart3,
      color: 'purple' as const
    },
    {
      title: 'Platform Settings',
      description: 'Configure system settings',
      href: '/lms/admin/settings',
      icon: Settings,
      color: 'yellow' as const
    }
  ]

  return (
    <LMSProtectedRoute requiredSection="admin">
      <LMSLayout userRole="ADMIN">
        {/* Welcome Section */}
        <div className="mb-8">
          <WelcomeCard 
            userName={user?.firstName || 'Admin'} 
            userRole="ADMIN" 
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="blue"
            change="+12 this month"
          />
          <StatsCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            color="green"
            change="+3 this week"
          />
          <StatsCard
            title="Platform Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={TrendingUp}
            color="yellow"
            change="+25% this month"
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers}
            icon={Shield}
            color="red"
            change="+8% this week"
          />
        </div>

        {/* Quick Actions and User Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <QuickActions actions={quickActions} />
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  View all users
                </button>
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex space-x-4 p-4">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {users.slice(0, 5).map((userData) => (
                    <div key={userData.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {userData.name?.charAt(0) || userData.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {userData.name || 'No name'}
                          </p>
                          <p className="text-xs text-gray-500">{userData.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(userData.role)}`}>
                        {userData.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Role Change Modal */}
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Change Role for {selectedUser.name || selectedUser.email}
              </h3>
              
              <div className="space-y-3 mb-6">
                {Object.values(UserRole).map((role) => (
                  <label key={role} className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="mr-3"
                    />
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(role)}`}>
                      {role}
                    </span>
                  </label>
                ))}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => selectedRole && handleRoleChange(selectedUser.id, selectedRole as UserRole)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors flex-1"
                  disabled={!selectedRole}
                >
                  Update Role
                </button>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </LMSLayout>
    </LMSProtectedRoute>
  )
}
