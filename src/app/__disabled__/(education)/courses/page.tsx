'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useBusinessVertical } from '../../../shared/context/BusinessVerticalContext';
import { Navbar } from '../../../shared/components/layout/Navbar';
import { Footer } from '../../../shared/components/layout/Footer';
import { SectionHeading } from '../../../shared/components/common/SectionHeading';
import CourseCard from '../../../features/education/components/CourseCard';
import { Button } from '../../../shared/components/ui/Button';

interface Course {
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
  isEnrolled?: boolean;
  canAccess?: boolean;
  paymentStatus?: string | null;
  userProgress?: number;
  categories?: Array<{ category: { name: string } }>;
}

interface Category {
  id: string;
  name: string;
}

export default function CoursesPage() {
  const { user, isLoaded } = useUser();
  const { setVertical } = useBusinessVertical();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Set business vertical context
  useEffect(() => {
    setVertical('education');
  }, [setVertical]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, categoriesResponse] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/categories')
        ]);

        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData.courses);
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      window.location.href = '/sign-in';
      return;
    }

    try {
      const response = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId })
      });

      if (response.ok) {
        const result = await response.json();
        // Update the course to show as enrolled
        setCourses(prev => 
          prev.map(course => 
            course.id === courseId 
              ? { 
                  ...course, 
                  isEnrolled: true,
                  canAccess: result.enrollment.course.price === 0
                }
              : course
          )
        );

        alert(result.message);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('An error occurred while enrolling');
    }
  };

  const handlePayment = async (courseId: string) => {
    // TODO: Integrate Paystack payment
    console.log('Payment for course:', courseId);
    alert('Payment integration coming soon!');
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || 
      course.categories?.some((cat: any) => cat.category.id === selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar vertical="education" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <SectionHeading
            eyebrow="Learn & Grow"
            title="Professional Certification Courses"
            description="Discover globally recognized courses designed to advance your tech career in Africa"
          />
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <input
                type="text"
                id="search"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Access Code Enrollment - Only show for authenticated students */}
        {user && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Have an Access Code?</h3>
                <p className="text-blue-700">Enter your course access code to enroll directly</p>
              </div>
              <Button variant="outline" className="text-blue-700 border-blue-700 hover:bg-blue-100">
                Enter Code
              </Button>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all courses
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                thumbnail={course.thumbnail}
                price={course.price}
                instructor={course.instructor}
                _count={course._count}
                isEnrolled={course.isEnrolled}
                canAccess={course.canAccess}
                paymentStatus={course.paymentStatus}
                userProgress={course.userProgress}
                onEnroll={handleEnroll}
                onPayment={handlePayment}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
