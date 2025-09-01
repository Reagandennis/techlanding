'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessVertical } from '../../../../shared/context/BusinessVerticalContext';
import { Navbar } from '../../../../shared/components/layout/Navbar';
import { Footer } from '../../../../shared/components/layout/Footer';
import { Button } from '../../../../shared/components/ui/Button';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  level: string;
  duration: number; // in hours
  language: string;
  requirements: string[];
  objectives: string[];
  createdAt: string;
  updatedAt: string;
  instructor: {
    id: string;
    name: string;
    email: string;
    image?: string;
    bio?: string;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
  lessons: Array<{
    id: string;
    title: string;
    description?: string;
    duration: number;
    videoUrl?: string;
    position: number;
    isPublished: boolean;
    isFree: boolean;
  }>;
  _count: {
    lessons: number;
    enrollments: number;
    reviews: number;
  };
  isEnrolled?: boolean;
  canAccess?: boolean;
  paymentStatus?: string | null;
  userProgress?: {
    completedLessons: number;
    progressPercent: number;
    lastAccessedLesson?: {
      id: string;
      title: string;
    };
  };
  averageRating?: number;
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { setVertical } = useBusinessVertical();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Set business vertical context
  useEffect(() => {
    setVertical('education');
  }, [setVertical]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setCourse(data.course);
        } else {
          console.error('Failed to fetch course');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [params.id]);

  const handleEnroll = async () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    try {
      const response = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId: params.id })
      });

      if (response.ok) {
        const result = await response.json();
        setCourse(prev => prev ? {
          ...prev,
          isEnrolled: true,
          canAccess: result.enrollment.course.price === 0
        } : null);

        alert(result.message);
        
        // If free course, redirect to first lesson
        if (result.enrollment.course.price === 0 && course?.lessons.length > 0) {
          const firstLesson = course.lessons.find(lesson => lesson.isPublished);
          if (firstLesson) {
            router.push(`/courses/${params.id}/lessons/${firstLesson.id}`);
          }
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('An error occurred while enrolling');
    }
  };

  const handleStartLearning = () => {
    if (!course?.lessons.length) return;
    
    const firstLesson = course.userProgress?.lastAccessedLesson || 
                       course.lessons.find(lesson => lesson.isPublished);
    
    if (firstLesson) {
      router.push(`/courses/${params.id}/lessons/${firstLesson.id}`);
    }
  };

  const handlePayment = () => {
    // TODO: Integrate Paystack payment
    console.log('Payment for course:', params.id);
    alert('Payment integration coming soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar vertical="education" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
            <Button onClick={() => router.push('/courses')}>
              Back to Courses
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar vertical="education" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Course Thumbnail */}
            <div className="lg:col-span-1">
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3z" />
                    </svg>
                    <p className="text-gray-500">Course Preview</p>
                  </div>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="lg:col-span-2 p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {course.categories.map(({ category }) => (
                      <span
                        key={category.id}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {course.title}
                  </h1>
                  
                  <p className="text-gray-600 mb-6 text-lg">
                    {course.description}
                  </p>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{course._count.lessons}</div>
                      <div className="text-sm text-gray-600">Lessons</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{course.duration}h</div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{course.level}</div>
                      <div className="text-sm text-gray-600">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{course._count.enrollments}</div>
                      <div className="text-sm text-gray-600">Students</div>
                    </div>
                  </div>
                </div>

                {/* Enrollment Card */}
                <div className="ml-8 bg-gray-50 rounded-lg p-6 min-w-[280px]">
                  <div className="text-center mb-4">
                    {course.price === 0 ? (
                      <div className="text-3xl font-bold text-green-600">Free</div>
                    ) : (
                      <div className="text-3xl font-bold text-gray-900">
                        ${course.price}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar for Enrolled Students */}
                  {course.isEnrolled && course.userProgress && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.userProgress.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${course.userProgress.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {!course.isEnrolled ? (
                      <Button
                        onClick={handleEnroll}
                        className="w-full"
                        size="lg"
                      >
                        {course.price === 0 ? 'Enroll Free' : 'Enroll Now'}
                      </Button>
                    ) : !course.canAccess ? (
                      <Button
                        onClick={handlePayment}
                        className="w-full"
                        size="lg"
                      >
                        Complete Payment
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStartLearning}
                        className="w-full"
                        size="lg"
                      >
                        {course.userProgress?.progressPercent === 0 ? 'Start Learning' : 'Continue Learning'}
                      </Button>
                    )}

                    {/* Wishlist/Save for Later */}
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      Add to Wishlist
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'curriculum', name: 'Curriculum' },
                { id: 'instructor', name: 'Instructor' },
                { id: 'reviews', name: 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* What You'll Learn */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.objectives.map((objective, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{objective}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                {course.requirements.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {course.requirements.map((requirement, index) => (
                        <li key={index} className="text-gray-700">{requirement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Course Details */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Course Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Language</h4>
                      <p className="text-gray-700">{course.language}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Duration</h4>
                      <p className="text-gray-700">{course.duration} hours</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Level</h4>
                      <p className="text-gray-700">{course.level}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Last Updated</h4>
                      <p className="text-gray-700">{new Date(course.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Course Curriculum</h3>
                <div className="space-y-4">
                  {course.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`border rounded-lg p-4 ${
                        lesson.isPublished ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                            {lesson.position}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                            {lesson.description && (
                              <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {lesson.isFree && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              Free
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {lesson.duration} min
                          </span>
                          {lesson.videoUrl && (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-4a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'instructor' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Meet Your Instructor</h3>
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    {course.instructor.image ? (
                      <img
                        src={course.instructor.image}
                        alt={course.instructor.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{course.instructor.name}</h4>
                    {course.instructor.bio && (
                      <p className="text-gray-700 mb-4">{course.instructor.bio}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Instructor</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{course.instructor.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Student Reviews ({course._count.reviews})
                </h3>
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h4>
                  <p className="text-gray-600">
                    Be the first to leave a review for this course!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
