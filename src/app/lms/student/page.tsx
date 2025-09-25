'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { BookOpen, Play, CheckCircle, Award, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import LMSLayout from '@/components/LMSLayout'
import { UserRole } from '@prisma/client'

interface DashboardStats {
  enrolledCourses: number
  completedCourses: number
  totalProgress: number
  certificates: number
}

export default function StudentDashboard() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    completedCourses: 0,
    totalProgress: 0,
    certificates: 0
  })
  const [recentCourses, setRecentCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole>(UserRole.USER)

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchDashboardData()
    } else if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/lms/student/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentCourses(data.recentCourses)
        setUserRole(data.userRole)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <LMSLayout userRole={userRole} currentSection="student">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName || 'Student'}!</h1>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enrolledCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProgress}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.certificates}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Continue Learning</h2>
              <div className="space-y-4">
                {recentCourses.map(course => (
                  <Link href={`/lms/courses/${course.id}`} key={course.id}>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Play className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-600">{course.instructor}</p>
                        </div>
                      </div>
                      <div className="text-red-600 hover:text-red-700 font-medium">
                        Continue
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <Link href="/courses" className="block w-full bg-red-600 text-white py-3 px-4 rounded-lg text-center hover:bg-red-700 transition-colors">
                  Browse All Courses
                </Link>
                <Link href="/community-tour" className="block w-full border border-red-600 text-red-600 py-3 px-4 rounded-lg text-center hover:bg-red-50 transition-colors">
                  Join Community
                </Link>
                <Link href="/eligibility-check" className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg text-center hover:bg-gray-50 transition-colors">
                  Check Eligibility
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LMSLayout>
  )
}

