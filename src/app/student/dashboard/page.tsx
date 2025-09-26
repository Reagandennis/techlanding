'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target, 
  PlayCircle, 
  CheckCircle2, 
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
  User,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Breadcrumb from '@/components/ui/Breadcrumb'

interface StudentStats {
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  totalWatchTime: number
  certificatesEarned: number
  currentStreak: number
  totalPoints: number
  averageProgress: number
}

interface EnrolledCourse {
  id: string
  title: string
  thumbnail: string
  instructor: {
    name: string
    image: string
  }
  progress: number
  totalLessons: number
  completedLessons: number
  lastAccessed: string
  estimatedTimeLeft: number
  nextLesson?: {
    id: string
    title: string
    type: string
  }
}

interface RecentActivity {
  id: string
  type: 'lesson_completed' | 'quiz_passed' | 'certificate_earned' | 'course_started'
  title: string
  courseName: string
  timestamp: string
  points?: number
}

interface UpcomingDeadline {
  id: string
  title: string
  courseName: string
  type: 'assignment' | 'quiz' | 'exam'
  dueDate: string
  priority: 'high' | 'medium' | 'low'
}

export default function StudentDashboard() {
  const { user, isLoaded } = useUser()
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetchDashboardData()
    }
  }, [isLoaded, user])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, coursesRes, activityRes, deadlinesRes] = await Promise.all([
        fetch('/api/student/stats'),
        fetch('/api/student/enrolled-courses'),
        fetch('/api/student/recent-activity'),
        fetch('/api/student/upcoming-deadlines')
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (coursesRes.ok) setEnrolledCourses(await coursesRes.json())
      if (activityRes.ok) setRecentActivity(await activityRes.json())
      if (deadlinesRes.ok) setUpcomingDeadlines(await deadlinesRes.json())
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatWatchTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'quiz_passed':
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 'certificate_earned':
        return <Award className="h-4 w-4 text-blue-500" />
      case 'course_started':
        return <PlayCircle className="h-4 w-4 text-purple-500" />
      default:
        return <BookOpen className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Student Portal', href: '/student' },
          { label: 'Dashboard' }
        ]} 
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-1">Continue your learning journey</p>
        </div>
        <Button asChild>
          <Link href="/courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Browse Courses
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.inProgressCourses} in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCourses}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.completedCourses / stats.totalCourses) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatWatchTime(stats.totalWatchTime)}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <p className="text-xs text-muted-foreground">
                Days in a row
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="deadlines">Upcoming</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <img 
                      src={course.thumbnail || '/placeholder-course.jpg'} 
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <img 
                        src={course.instructor.image || '/placeholder-avatar.jpg'} 
                        alt={course.instructor.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-600">{course.instructor.name}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{Math.round(course.progress)}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                        <span>{formatWatchTime(course.estimatedTimeLeft)} left</span>
                      </div>

                      {course.nextLesson && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">Next:</p>
                          <p className="text-sm text-blue-700">{course.nextLesson.title}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button asChild className="flex-1">
                        <Link href={`/courses/${course.id}/learn`}>
                          Continue Learning
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course</p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning achievements</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.courseName}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                      {activity.points && (
                        <Badge variant="secondary">+{activity.points} pts</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Don't miss these important dates</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length > 0 ? (
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{deadline.title}</p>
                        <p className="text-sm text-gray-600">{deadline.courseName}</p>
                        <p className="text-sm text-gray-500">{deadline.dueDate}</p>
                      </div>
                      <Badge className={getPriorityColor(deadline.priority)}>
                        {deadline.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">No upcoming deadlines</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>Badges and certificates you've earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats && stats.certificatesEarned > 0 ? (
                  // This would be populated with actual achievements
                  <div className="text-center p-6 border rounded-lg">
                    <Award className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                    <p className="font-medium">Course Completion</p>
                    <p className="text-sm text-gray-600">{stats.certificatesEarned} certificates</p>
                  </div>
                ) : (
                  <p className="text-center text-gray-600 col-span-full">
                    Complete courses to earn achievements
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}