import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Play,
  CheckCircle,
  Lock
} from 'lucide-react';
import Link from 'next/link';

interface CoursePageProps {
  params: { courseId: string };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { userId } = auth();

  try {
    // Get course data
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            order: true,
            isPublished: true,
            isFree: true,
          },
          where: { isPublished: true },
          orderBy: { order: 'asc' },
        },
        enrollments: userId ? {
          where: { userId: userId },
          select: {
            id: true,
            enrolledAt: true,
            progress: true,
          },
        } : false,
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
              <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }

    const isEnrolled = userId && course.enrollments && course.enrollments.length > 0;
    const totalDuration = course.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                      <p className="text-gray-600 text-lg mb-4">{course.shortDescription}</p>
                    </div>
                    {course.thumbnailUrl && (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-32 h-20 rounded-lg object-cover ml-4"
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {course._count.enrollments} students
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {course.lessons.length} lessons
                      </span>
                    </div>
                    <Badge variant="secondary">{course.level}</Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    {isEnrolled ? (
                      <Link href={`/courses/${course.id}/learn`}>
                        <Button size="lg" className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Continue Learning
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/courses/${course.id}/enroll`}>
                        <Button size="lg">
                          {course.price > 0 ? `Enroll for $${course.price}` : 'Enroll for Free'}
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" size="lg">
                      Add to Wishlist
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Course Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{course.description}</p>
                </CardContent>
              </Card>

              {/* Course Curriculum */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {course.lessons.map((lesson, index) => {
                      const isAccessible = isEnrolled || lesson.isFree;
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isAccessible
                              ? 'bg-white hover:bg-gray-50'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {isAccessible ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                              <h4 className={`font-medium ${
                                isAccessible ? 'text-gray-900' : 'text-gray-500'
                              }`}>
                                {index + 1}. {lesson.title}
                              </h4>
                              {lesson.description && (
                                <p className="text-sm text-gray-600">{lesson.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {lesson.duration && (
                              <span className="text-sm text-gray-500">
                                {lesson.duration}m
                              </span>
                            )}
                            {lesson.isFree && (
                              <Badge variant="outline" className="text-xs">Free</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Instructor */}
              <Card>
                <CardHeader>
                  <CardTitle>Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={course.instructor.image || ''} alt={course.instructor.name || ''} />
                      <AvatarFallback>
                        {course.instructor.name?.charAt(0).toUpperCase() || 'I'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{course.instructor.name}</h3>
                      {course.instructor.bio && (
                        <p className="text-sm text-gray-600 mt-1">{course.instructor.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students Enrolled</span>
                    <span className="font-medium">{course._count.enrollments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Lessons</span>
                    <span className="font-medium">{course.lessons.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">
                      {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );

  } catch (error) {
    console.error('Error loading course:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-4">Failed to load course information.</p>
            <Link href="/courses">
              <Button>Back to Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
}