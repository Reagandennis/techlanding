'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { BookOpen, Play, CheckCircle, Award, Clock, TrendingUp, FileText, GraduationCap, Calendar, Trophy } from 'lucide-react'
import Link from 'next/link'
import LMSLayout from '@/components/lms/LMSLayout'
import { 
  WelcomeCard, 
  StatsCard, 
  CourseProgress, 
  RecentActivity, 
  UpcomingDeadlines, 
  QuickActions 
} from '@/components/lms/DashboardWidgets'
import { UserRole } from '@prisma/client'

interface DeadlineItem {
  id: string;
  title: string;
  type: 'assignment' | 'quiz' | 'project';
  dueDate: string;
  courseTitle: string;
}

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

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

  // Prepare data for dashboard widgets
  const courses = recentCourses.map(course => ({
    id: course.id,
    title: course.title,
    progress: Math.floor(Math.random() * 100), // Replace with actual progress
    totalLessons: 12,
    completedLessons: Math.floor(Math.random() * 12)
  }))

  const activities = [
    {
      id: '1',
      type: 'course_completed' as const,
      title: 'Completed JavaScript Fundamentals',
      description: 'You successfully completed the course',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'assignment_submitted' as const,
      title: 'Assignment submitted',
      description: 'React Components Assignment',
      timestamp: '1 day ago'
    }
  ]

  const deadlines: DeadlineItem[] = [
    {
      id: '1',
      title: 'JavaScript Assignment',
      type: 'assignment',
      dueDate: 'Tomorrow',
      courseTitle: 'Web Development'
    },
    {
      id: '2',
      title: 'React Quiz',
      type: 'quiz',
      dueDate: 'In 3 days',
      courseTitle: 'Advanced React'
    }
  ]

  const quickActions: QuickAction[] = [
    {
      title: 'Browse Courses',
      description: 'Find new courses',
      href: '/lms/student/courses',
      icon: BookOpen,
      color: 'blue'
    },
    {
      title: 'Assignments',
      description: 'View pending tasks',
      href: '/lms/student/assignments',
      icon: FileText,
      color: 'green'
    },
    {
      title: 'Certificates',
      description: 'Your achievements',
      href: '/lms/student/certificates',
      icon: GraduationCap,
      color: 'purple'
    },
    {
      title: 'Calendar',
      description: 'View schedule',
      href: '/lms/student/calendar',
      icon: Calendar,
      color: 'yellow'
    }
  ]

  return (
    <LMSLayout userRole="STUDENT">
      {/* Welcome Section */}
      <div className="mb-8">
        <WelcomeCard 
          userName={user?.firstName || 'Student'} 
          userRole="STUDENT" 
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Enrolled Courses"
          value={stats.enrolledCourses}
          icon={BookOpen}
          color="blue"
          change="+2 this month"
        />
        <StatsCard
          title="Completed Courses"
          value={stats.completedCourses}
          icon={Trophy}
          color="green"
          change="+1 this week"
        />
        <StatsCard
          title="Average Progress"
          value={`${stats.totalProgress}%`}
          icon={TrendingUp}
          color="yellow"
          change="+15% this week"
        />
        <StatsCard
          title="Certificates"
          value={stats.certificates}
          icon={Award}
          color="red"
        />
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CourseProgress courses={courses} />
        <RecentActivity activities={activities} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingDeadlines deadlines={deadlines} />
        <QuickActions actions={quickActions} />
      </div>
    </LMSLayout>
  )
}

