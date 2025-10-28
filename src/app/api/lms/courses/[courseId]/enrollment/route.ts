import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: {
    courseId: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { userId } = auth();
    const { courseId } = params;

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            name: true,
            bio: true,
            imageUrl: true
          }
        },
        category: {
          select: {
            name: true,
            color: true
          }
        },
        lessons: {
          select: {
            id: true,
            duration: true
          }
        },
        quizzes: {
          select: {
            id: true
          }
        },
        assignments: {
          select: {
            id: true
          }
        },
        enrollments: {
          select: {
            id: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false;
    let enrollmentStatus = null;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true }
      });

      if (user) {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: courseId
            }
          },
          select: {
            status: true
          }
        });

        isEnrolled = !!enrollment;
        enrollmentStatus = enrollment?.status || null;
      }
    }

    // Calculate instructor stats
    const instructorStats = await prisma.user.findUnique({
      where: { id: course.instructorId },
      include: {
        coursesAsInstructor: {
          include: {
            _count: {
              select: {
                enrollments: true
              }
            }
          }
        },
        _count: {
          select: {
            coursesAsInstructor: true
          }
        }
      }
    });

    const totalStudents = instructorStats?.coursesAsInstructor.reduce(
      (sum, course) => sum + course._count.enrollments, 0
    ) || 0;

    // Calculate course rating (simplified)
    const avgRating = await prisma.review.aggregate({
      where: { courseId: courseId },
      _avg: { rating: true }
    });

    // Calculate total duration
    const totalDuration = course.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

    // Mock instructor expertise and bio (in production, these would be stored in the database)
    const instructorExpertise = ['JavaScript', 'React', 'Node.js']; // This should come from DB
    const instructorBio = course.instructor.bio || 'Experienced instructor with years of expertise.';

    // Mock course data that would typically be stored in the database
    const courseData = {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      price: course.price || 0,
      isFree: !course.price || course.price === 0,
      level: course.level || 'BEGINNER',
      duration: totalDuration,
      language: course.language || 'English',
      hasSubtitles: course.hasSubtitles || false,
      hasCertificate: course.hasCertificate || false,
      instructor: {
        name: course.instructor.name,
        bio: instructorBio,
        avatar: course.instructor.imageUrl,
        expertise: instructorExpertise,
        totalStudents: totalStudents,
        rating: 4.8 // This should be calculated from instructor reviews
      },
      category: {
        name: course.category?.name || 'General',
        color: course.category?.color || '#6B7280'
      },
      skills: course.skills || ['Programming', 'Web Development'], // Mock data
      requirements: course.requirements || ['Basic computer skills'], // Mock data
      whatYouWillLearn: course.whatYouWillLearn || [
        'Build modern applications',
        'Understand core concepts',
        'Apply best practices'
      ], // Mock data
      totalLessons: course.lessons.length,
      totalQuizzes: course.quizzes.length,
      totalAssignments: course.assignments.length,
      enrollmentCount: course._count.enrollments,
      rating: Number(avgRating._avg.rating?.toFixed(1)) || 0,
      reviewCount: course._count.reviews,
      lastUpdated: course.updatedAt.toISOString(),
      isEnrolled,
      enrollmentStatus: enrollmentStatus as 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | null
    };

    return NextResponse.json({
      course: courseData
    });

  } catch (error) {
    console.error('Error fetching course enrollment details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course details' },
      { status: 500 }
    );
  }
}