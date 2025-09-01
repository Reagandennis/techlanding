'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../componets/Navbar';
import Footer from '../componets/Footer';
import SectionHeading from '../componets/SectionHeading';
import Button from '../componets/Button';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Plus,
  Eye,
  Edit,
  DollarSign,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react';

interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  avgRating: number;
  completionRate: number;
  thisMonthEnrollments: number;
}

interface Course {
  id: string;
  title: string;
  students: number;
  revenue: number;
  rating: number;
  status: 'published' | 'draft';
  thumbnail?: string;
}

export default function InstructorPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<InstructorStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0,
    completionRate: 0,
    thisMonthEnrollments: 0
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in');
        return;
      }
      
      fetchInstructorData();
    }
  }, [user, isLoaded, router]);

  const fetchInstructorData = async () => {
    try {
      // This would be your actual instructor API endpoints
      // For now using placeholder data
      setStats({
        totalCourses: 8,
        totalStudents: 342,
        totalRevenue: 12500,
        avgRating: 4.7,
        completionRate: 78,
        thisMonthEnrollments: 45
      });

      setCourses([
        {
          id: '1',
          title: 'React Development Fundamentals',
          students: 156,
          revenue: 4680,
          rating: 4.8,
          status: 'published'
        },
        {
          id: '2',
          title: 'Advanced JavaScript Concepts',
          students: 89,
          revenue: 2670,
          rating: 4.6,
          status: 'published'
        },
        {
          id: '3',
          title: 'Python for Data Science',
          students: 97,
          revenue: 2910,
          rating: 4.7,
          status: 'published'
        },
        {
          id: '4',
          title: 'Machine Learning Basics',
          students: 0,
          revenue: 0,
          rating: 0,
          status: 'draft'
        }
      ]);
    } catch (error) {
      console.error('Error fetching instructor data:', error);
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <SectionHeading
              eyebrow="Instructor Dashboard"
              title={`Welcome back, ${user?.firstName || 'Instructor'}!`}
              description="Manage your courses and track your teaching impact"
            />
          </div>
          <Button href="/instructor/courses/create">
            <Plus className="h-5 w-5 mr-2" />
            Create New Course
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-500" />
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
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonthEnrollments}</p>
                <p className="text-xs text-gray-500">New Enrollments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                href="/instructor/courses/create"
                variant="outline"
                className="flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Course
              </Button>

              <Button
                href="/instructor/analytics"
                variant="outline"
                className="flex items-center justify-center"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                View Analytics
              </Button>

              <Button
                href="/instructor/students"
                variant="outline"
                className="flex items-center justify-center"
              >
                <Users className="h-5 w-5 mr-2" />
                Manage Students
              </Button>

              <Button
                href="/instructor/earnings"
                variant="outline"
                className="flex items-center justify-center"
              >
                <DollarSign className="h-5 w-5 mr-2" />
                View Earnings
              </Button>
            </div>
          </div>
        </div>

        {/* My Courses */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
              <Button href="/instructor/courses" variant="outline">
                View All Courses
              </Button>
            </div>

            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          course.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.students} students
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${course.revenue.toLocaleString()} revenue
                        </div>
                        {course.rating > 0 && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" />
                            {course.rating} rating
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        href={`/instructor/courses/${course.id}`}
                        variant="outline"
                        className="flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        href={`/instructor/courses/${course.id}/edit`}
                        variant="outline"
                        className="flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
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
