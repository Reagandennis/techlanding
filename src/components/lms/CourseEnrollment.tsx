'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Lock, 
  Users, 
  Clock, 
  Star, 
  CheckCircle, 
  PlayCircle,
  BookOpen,
  Award,
  Globe,
  Shield,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

// Types
interface CourseDetails {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  price: number;
  isFree: boolean;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number; // in minutes
  language: string;
  hasSubtitles: boolean;
  hasCertificate: boolean;
  instructor: {
    name: string;
    bio: string;
    avatar: string | null;
    expertise: string[];
    totalStudents: number;
    rating: number;
  };
  category: {
    name: string;
    color: string;
  };
  skills: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  totalLessons: number;
  totalQuizzes: number;
  totalAssignments: number;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  lastUpdated: string;
  isEnrolled: boolean;
  enrollmentStatus?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

interface CourseEnrollmentProps {
  courseId: string;
  onEnrollmentSuccess?: () => void;
}

export const CourseEnrollment: React.FC<CourseEnrollmentProps> = ({
  courseId,
  onEnrollmentSuccess
}) => {
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  // Load course details
  React.useEffect(() => {
    const loadCourseDetails = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/lms/courses/${courseId}/enrollment`);
        if (!response.ok) {
          throw new Error('Failed to load course details');
        }
        
        const data = await response.json();
        setCourse(data.course);
        
      } catch (error) {
        console.error('Error loading course:', error);
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    loadCourseDetails();
  }, [courseId]);

  // Handle free enrollment
  const handleFreeEnrollment = async () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    try {
      setEnrolling(true);

      const response = await fetch('/api/lms/enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          paymentMethod: 'FREE'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Enrollment failed');
      }

      const data = await response.json();
      
      toast.success('Successfully enrolled in course!');
      setCourse(prev => prev ? { ...prev, isEnrolled: true, enrollmentStatus: 'ACTIVE' } : null);
      onEnrollmentSuccess?.();
      
      // Redirect to course
      router.push(`/courses/${courseId}`);

    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  // Handle paid enrollment
  const handlePaidEnrollment = async () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    try {
      setEnrolling(true);

      const response = await fetch('/api/lms/enrollment/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          successUrl: `${window.location.origin}/courses/${courseId}?enrolled=true`,
          cancelUrl: window.location.href
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment initiation failed');
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }

    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment');
      setEnrolling(false);
    }
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100); // assuming price is in cents
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading course details...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Not Found</h3>
          <p className="text-gray-600">The requested course could not be found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Course Header */}
      <div className="relative">
        <img
          src={course.thumbnailUrl || '/placeholder-course.jpg'}
          alt={course.title}
          className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
        <div className="absolute bottom-6 left-6 text-white">
          <Badge variant="secondary" className="mb-2">
            {course.category.name}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
          <p className="text-lg text-gray-200 max-w-2xl">{course.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course Info */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">{formatDuration(course.duration)}</p>
                </div>
                <div className="text-center">
                  <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Lessons</p>
                  <p className="font-semibold">{course.totalLessons}</p>
                </div>
                <div className="text-center">
                  <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="font-semibold">{course.enrollmentCount.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="font-semibold">{course.rating} ({course.reviewCount})</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <Badge variant={course.level === 'BEGINNER' ? 'default' : course.level === 'INTERMEDIATE' ? 'secondary' : 'outline'}>
                  {course.level}
                </Badge>
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="h-4 w-4 mr-1" />
                  {course.language}
                </div>
                {course.hasSubtitles && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="h-4 w-4 mr-1" />
                    Subtitles
                  </div>
                )}
                {course.hasCertificate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-1" />
                    Certificate
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Skills you'll gain</h3>
                <div className="flex flex-wrap gap-2">
                  {course.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* What you'll learn */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">What you'll learn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {course.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {course.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <ArrowRight className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructor */}
          <Card>
            <CardHeader>
              <CardTitle>Meet your instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={course.instructor.avatar || ''} alt={course.instructor.name} />
                  <AvatarFallback className="text-lg">
                    {course.instructor.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{course.instructor.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.instructor.totalStudents.toLocaleString()} students
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      {course.instructor.rating} rating
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{course.instructor.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {course.instructor.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrollment Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              {/* Enrollment Status */}
              {course.isEnrolled ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      You're enrolled!
                    </h3>
                    <Badge variant="default" className="mb-4">
                      {course.enrollmentStatus}
                    </Badge>
                  </div>
                  
                  <Link href={`/courses/${courseId}`} className="block">
                    <Button className="w-full" size="lg">
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Continue Learning
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard/student" className="block">
                    <Button variant="outline" className="w-full">
                      View Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Price */}
                  <div className="text-center">
                    {course.isFree ? (
                      <div>
                        <span className="text-3xl font-bold text-green-600">FREE</span>
                        <p className="text-sm text-gray-600 mt-1">
                          Get started with this free course
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(course.price)}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          One-time payment • Lifetime access
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Course Content Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Lessons</span>
                      <span className="font-medium">{course.totalLessons}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quizzes</span>
                      <span className="font-medium">{course.totalQuizzes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Assignments</span>
                      <span className="font-medium">{course.totalAssignments}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{formatDuration(course.duration)}</span>
                    </div>
                  </div>

                  {/* Enrollment Button */}
                  {user ? (
                    <Button
                      onClick={course.isFree ? handleFreeEnrollment : handlePaidEnrollment}
                      disabled={enrolling}
                      className="w-full"
                      size="lg"
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          {course.isFree ? 'Enrolling...' : 'Processing...'}
                        </>
                      ) : (
                        <>
                          {course.isFree ? (
                            <>
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Enroll for Free
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-5 w-5 mr-2" />
                              Enroll Now
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Link href="/sign-in" className="block">
                        <Button className="w-full" size="lg">
                          <Lock className="h-5 w-5 mr-2" />
                          Sign In to Enroll
                        </Button>
                      </Link>
                      <p className="text-xs text-gray-600 text-center">
                        Create an account to start learning
                      </p>
                    </div>
                  )}

                  {/* Guarantees */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Lifetime access
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Mobile and desktop access
                    </div>
                    {course.hasCertificate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        Certificate of completion
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollment;