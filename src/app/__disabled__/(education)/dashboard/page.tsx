'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessVertical } from '../../../shared/context/BusinessVerticalContext';
import { Navbar } from '../../../shared/components/layout/Navbar';
import { Footer } from '../../../shared/components/layout/Footer';
import { SectionHeading } from '../../../shared/components/common/SectionHeading';
import CourseCard from '../../../features/education/components/CourseCard';
import { Button } from '../../../shared/components/ui/Button';

interface EnrolledCourse {
  id: string;
  enrolledAt: string;
  paymentStatus: string | null;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    price: number;
    instructor: {
      name: string;
      image?: string;
    };
    _count: {
      lessons: number;
      enrollments: number;
    };
  };
  userProgress?: {
    completedLessons: number;
    progressPercent: number;
    lastAccessedLesson?: {
      id: string;
      title: string;
    };
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  unlockedAt: string;
}

interface DashboardStats {
  totalEnrollments: number;
  completedCourses: number;
  totalCertificates: number;
  totalBadges: number;
  hoursSpent: number;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { setVertical } = useBusinessVertical();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEnrollments: 0,
    completedCourses: 0,
    totalCertificates: 0,
    totalBadges: 0,
    hoursSpent: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Set business vertical context
  useEffect(() => {
    setVertical('education');
  }, [setVertical]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/student/enrolled-courses');
        
        if (response.ok) {
          const data = await response.json();
          setEnrolledCourses(data.enrolledCourses);
          
          // Calculate stats from enrolled courses
          const totalEnrollments = data.enrolledCourses.length;
          const completedCourses = data.enrolledCourses.filter(
            (enrollment: EnrolledCourse) => 
              enrollment.userProgress?.progressPercent === 100
          ).length;

          setStats(prev => ({
            ...prev,
            totalEnrollments,
            completedCourses
          }));
        }

        // TODO: Fetch achievements, certificates, badges data from API
        // For now using placeholder data
        setRecentAchievements([
          {
            id: '1',
            title: 'First Course Enrolled',
            description: 'Successfully enrolled in your first course',
            icon: '🎓',
            unlockedAt: new Date().toISOString()
          }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleContinueLearning = (courseId: string, lessonId?: string) => {
    const url = lessonId 
      ? `/courses/${courseId}/lessons/${lessonId}`
      : `/courses/${courseId}`;
    router.push(url);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to sign-in
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar vertical="education" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <SectionHeading
            eyebrow="Welcome Back"
            title={`Hello, ${user.firstName || 'Student'}!`}
            description="Continue your learning journey and track your progress"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Badges</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBadges}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hours Spent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hoursSpent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => router.push('/courses')}
                className="flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Browse Courses</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.push('/certificates')}
                className="flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>View Certificates</span>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => router.push('/achievements')}
                className="flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>Achievements</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Current Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
            <Button 
              variant="outline" 
              onClick={() => router.push('/courses')}
            >
              View All Courses
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses enrolled yet</h3>
              <p className="text-gray-600 mb-4">
                Start your learning journey by enrolling in a course
              </p>
              <Button onClick={() => router.push('/courses')}>
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.slice(0, 6).map(enrollment => (
                <CourseCard
                  key={enrollment.course.id}
                  id={enrollment.course.id}
                  title={enrollment.course.title}
                  description={enrollment.course.description}
                  thumbnail={enrollment.course.thumbnail}
                  price={enrollment.course.price}
                  instructor={enrollment.course.instructor}
                  _count={enrollment.course._count}
                  isEnrolled={true}
                  canAccess={enrollment.paymentStatus === 'completed' || enrollment.course.price === 0}
                  paymentStatus={enrollment.paymentStatus}
                  userProgress={enrollment.userProgress?.progressPercent}
                  onContinue={() => handleContinueLearning(
                    enrollment.course.id,
                    enrollment.userProgress?.lastAccessedLesson?.id
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="space-y-4">
                  {recentAchievements.map(achievement => (
                    <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                        <p className="text-gray-600">{achievement.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
