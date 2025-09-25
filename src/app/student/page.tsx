'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeading from '@/components/SectionHeading';
import Button from '@/components/Button';
import { 
  BookOpen, 
  Award, 
  Clock, 
  TrendingUp,
  Play,
  CheckCircle,
  Star,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';

interface StudentStats {
  enrolledCourses: number;
  completedCourses: number;
  certificatesEarned: number;
  hoursLearned: number;
  currentStreak: number;
  totalBadges: number;
}

interface EnrolledCourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  thumbnail?: string;
  nextLesson?: string;
  totalLessons: number;
  completedLessons: number;
}

interface RecentActivity {
  id: string;
  type: 'lesson_completed' | 'quiz_passed' | 'certificate_earned' | 'badge_earned';
  title: string;
  course?: string;
  date: string;
  icon: string;
}

export default function StudentPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<StudentStats>({
    enrolledCourses: 0,
    completedCourses: 0,
    certificatesEarned: 0,
    hoursLearned: 0,
    currentStreak: 0,
    totalBadges: 0
  });
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in');
        return;
      }
      
      fetchStudentData();
    }
  }, [user, isLoaded, router]);

  const fetchStudentData = async () => {
    try {
      // This would be your actual student API endpoints
      // For now using placeholder data
      setStats({
        enrolledCourses: 6,
        completedCourses: 3,
        certificatesEarned: 2,
        hoursLearned: 45,
        currentStreak: 7,
        totalBadges: 8
      });

      setEnrolledCourses([
        {
          id: '1',
          title: 'React Development Fundamentals',
          instructor: 'John Smith',
          progress: 75,
          nextLesson: 'Advanced Hooks',
          totalLessons: 24,
          completedLessons: 18
        },
        {
          id: '2',
          title: 'Python for Data Science',
          instructor: 'Sarah Johnson',
          progress: 45,
          nextLesson: 'Data Visualization with Matplotlib',
          totalLessons: 30,
          completedLessons: 14
        },
        {
          id: '3',
          title: 'AWS Cloud Practitioner',
          instructor: 'Michael Brown',
          progress: 90,
          nextLesson: 'Final Exam Preparation',
          totalLessons: 20,
          completedLessons: 18
        },
        {
          id: '4',
          title: 'JavaScript ES6+',
          instructor: 'Emily Davis',
          progress: 25,
          nextLesson: 'Arrow Functions',
          totalLessons: 16,
          completedLessons: 4
        }
      ]);

      setRecentActivity([
        {
          id: '1',
          type: 'lesson_completed',
          title: 'React Hooks Deep Dive',
          course: 'React Development Fundamentals',
          date: '2 hours ago',
          icon: '✅'
        },
        {
          id: '2',
          type: 'quiz_passed',
          title: 'JavaScript Fundamentals Quiz',
          course: 'JavaScript ES6+',
          date: '1 day ago',
          icon: '🎯'
        },
        {
          id: '3',
          type: 'badge_earned',
          title: 'Streak Master',
          date: '2 days ago',
          icon: '🏆'
        },
        {
          id: '4',
          type: 'certificate_earned',
          title: 'Python Basics Certificate',
          course: 'Python for Data Science',
          date: '3 days ago',
          icon: '🎓'
        }
      ]);
    } catch (error) {
      console.error('Error fetching student data:', error);
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
      
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <SectionHeading
            eyebrow="Student Dashboard"
            title={`Welcome back, ${user?.firstName || 'Student'}!`}
            description="Continue your learning journey and track your progress"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enrolledCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.certificatesEarned}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hours Learned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hoursLearned}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.currentStreak} days</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Badges Earned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBadges}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
                  <Button href="/courses" variant="outline">
                    Browse More Courses
                  </Button>
                </div>

                <div className="space-y-4">
                  {enrolledCourses.slice(0, 3).map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                          <p className="text-sm text-gray-600">by {course.instructor}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{course.progress}%</div>
                          <div className="text-xs text-gray-500">
                            {course.completedLessons}/{course.totalLessons} lessons
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full transition-all" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Next: {course.nextLesson}
                        </div>
                        <Button
                          href={`/courses/${course.id}`}
                          variant="primary"
                          className="flex items-center"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <Button href="/courses" variant="outline" className="w-full justify-start">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Browse Courses
                  </Button>
                  <Button href="/certificates" variant="outline" className="w-full justify-start">
                    <Award className="h-5 w-5 mr-2" />
                    View Certificates
                  </Button>
                  <Button href="/badges" variant="outline" className="w-full justify-start">
                    <Star className="h-5 w-5 mr-2" />
                    My Badges
                  </Button>
                  <Button href="/progress" variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Progress Report
                  </Button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-lg">{activity.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        {activity.course && (
                          <p className="text-xs text-gray-600">{activity.course}</p>
                        )}
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Learning Goals */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Learning Goals</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium">Complete 2 courses this month</span>
                    </div>
                    <span className="text-xs text-gray-500">1/2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium">Study 5 days a week</span>
                    </div>
                    <span className="text-xs text-green-600">On track</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-purple-500 mr-2" />
                      <span className="text-sm font-medium">Earn 3 certificates</span>
                    </div>
                    <span className="text-xs text-gray-500">2/3</span>
                  </div>
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
