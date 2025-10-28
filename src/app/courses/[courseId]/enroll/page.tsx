import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CourseEnrollment from '@/components/lms/CourseEnrollment';
import CourseReviews from '@/components/lms/CourseReviews';

interface CourseEnrollmentPageProps {
  params: {
    courseId: string;
  };
}

export default async function CourseEnrollmentPage({ params }: CourseEnrollmentPageProps) {
  const { userId } = auth();
  const { courseId } = params;

  // Get course basic info to check if it exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { 
      id: true, 
      title: true, 
      isPublished: true,
      instructorId: true 
    }
  });

  if (!course || !course.isPublished) {
    redirect('/courses');
  }

  // Check if user is enrolled and can review
  let canReview = false;
  let isEnrolled = false;
  
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });

    if (user && user.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: courseId
          }
        }
      });

      isEnrolled = !!enrollment;
      
      // Can review if enrolled and hasn't reviewed yet
      if (isEnrolled) {
        const existingReview = await prisma.review.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: courseId
            }
          }
        });
        
        canReview = !existingReview;
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Course Enrollment Section */}
          <CourseEnrollment 
            courseId={courseId}
            onEnrollmentSuccess={() => {
              // Redirect to course content after successful enrollment
              window.location.href = `/courses/${courseId}`;
            }}
          />

          {/* Reviews Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Student Reviews</h2>
            </div>
            <div className="p-6">
              <CourseReviews 
                courseId={courseId}
                canReview={canReview}
                showAddReview={isEnrolled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}