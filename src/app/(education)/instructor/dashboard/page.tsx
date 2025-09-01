'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessVertical } from '../../../../shared/context/BusinessVerticalContext';
import { Navbar } from '../../../../shared/components/layout/Navbar';
import { Footer } from '../../../../shared/components/layout/Footer';
import { SectionHeading } from '../../../../shared/components/common/SectionHeading';
import { Button } from '../../../../shared/components/ui/Button';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award, 
  Plus, 
  Edit3, 
  Eye,
  BarChart3,
  MessageSquare,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  isPublished: boolean;
  createdAt: string;
  _count: {
    lessons: number;
    enrollments: number;
    reviews: number;
  };
}

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  pendingReviews: number;
}

interface RecentActivity {
  id: string;
  type: 'enrollment' | 'completion' | 'review' | 'question';
  description: string;
  timestamp: string;
  courseTitle: string;
  studentName?: string;
}

export default function InstructorDashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { setVertical } = useBusinessVertical();
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingReviews: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Set business vertical context
  useEffect(() => {
    setVertical('education');
  }, [setVertical]);

  // Check user role and redirect if not instructor/admin
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    if (user) {
      fetchUserRole();
    }
  }, [user, isLoaded, router]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.user.role);
        
        if (data.user.role !== 'INSTRUCTOR' && data.user.role !== 'ADMIN') {
          router.push('/dashboard');
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      router.push('/dashboard');
    }
  };

  useEffect(() => {
    if (!user || !userRole || (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN')) return;

    const fetchDashboardData = async () => {
      try {
        const [coursesResponse, statsResponse, activityResponse] = await Promise.all([
          fetch('/api/instructor/courses'),
          fetch('/api/instructor/stats'),
          fetch('/api/instructor/activity')
        ]);

        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData.courses);
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }

        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setRecentActivity(activityData.activities);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, userRole]);

  const handleCreateCourse = () => {
    router.push('/instructor/courses/create');
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/instructor/courses/${courseId}/edit`);
  };

  const handleViewCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  const handleViewAnalytics = (courseId: string) => {
    router.push(`/instructor/courses/${courseId}/analytics`);
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar vertical="education" />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar vertical="education" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <SectionHeading
            eyebrow="Instructor Portal"
            title={`Welcome back, ${user.firstName || 'Instructor'}!`}
            description="Manage your courses, track student progress, and grow your teaching impact"
          />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
                  <Button onClick={handleCreateCourse} className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>New Course</span>
                  </Button>
                </div>
              </div>

              <div className="p-6">
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first course to start teaching and earning
                    </p>
                    <Button onClick={handleCreateCourse}>
                      Create Your First Course
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {course.title}
                              </h3>
                              {!course.isPublished && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  Draft
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {course.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <BookOpen className="w-4 h-4" />
                                <span>{course._count.lessons} lessons</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{course._count.enrollments} students</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>{course._count.reviews} reviews</span>
                              </span>
                              {course.price > 0 && (
                                <span className="font-semibold text-green-600">
                                  ${course.price}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAnalytics(course.id)}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewCourse(course.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCourse(course.id)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={handleCreateCourse}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Course
                </Button>
                <Button
                  onClick={() => router.push('/instructor/students')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Students
                </Button>
                <Button
                  onClick={() => router.push('/instructor/analytics')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button
                  onClick={() => router.push('/instructor/reviews')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Manage Reviews
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'enrollment' ? 'bg-blue-500' :
                          activity.type === 'completion' ? 'bg-green-500' :
                          activity.type === 'review' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.courseTitle} • {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Performance Tips */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-3">💡 Tips to Improve</h3>
              <div className="space-y-2 text-sm text-red-800">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Add video content to increase engagement</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Create quizzes to improve completion rates</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Respond to student questions promptly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
