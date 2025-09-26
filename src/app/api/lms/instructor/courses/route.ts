import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { CourseStatus, LessonType, CourseLevel } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has instructor/admin role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });

    if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only instructors can create courses.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      shortDescription,
      description,
      level,
      language = 'en',
      tags = [],
      thumbnail,
      price = 0,
      discountPrice,
      currency = 'USD',
      modules = [],
      status = 'DRAFT',
      accessCode,
      prerequisites = []
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Check if slug already exists
    let finalSlug = slug;
    let counter = 1;
    while (true) {
      const existing = await prisma.course.findUnique({
        where: { slug: finalSlug }
      });
      if (!existing) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Start transaction to create course with modules and lessons
    const course = await prisma.$transaction(async (tx) => {
      // Create the course
      const newCourse = await tx.course.create({
        data: {
          title,
          slug: finalSlug,
          description,
          shortDescription,
          thumbnail,
          price: parseFloat(price.toString()),
          discountPrice: discountPrice ? parseFloat(discountPrice.toString()) : null,
          currency,
          status: status as CourseStatus,
          level: level as CourseLevel,
          language,
          tags,
          accessCode: accessCode || null,
          instructorId: user.id,
          publishedAt: status === 'PUBLISHED' ? new Date() : null,
        }
      });

      // Create modules and lessons if provided
      if (modules && modules.length > 0) {
        for (let i = 0; i < modules.length; i++) {
          const moduleData = modules[i];
          
          const newModule = await tx.module.create({
            data: {
              title: moduleData.title,
              description: moduleData.description || null,
              order: i + 1,
              courseId: newCourse.id,
              prerequisites: [],
            }
          });

          // Create lessons for this module
          if (moduleData.lessons && moduleData.lessons.length > 0) {
            for (let j = 0; j < moduleData.lessons.length; j++) {
              const lessonData = moduleData.lessons[j];
              
              await tx.lesson.create({
                data: {
                  title: lessonData.title,
                  description: lessonData.description || null,
                  content: lessonData.content || null,
                  videoUrl: lessonData.videoUrl || null,
                  duration: lessonData.duration || null,
                  order: j + 1,
                  type: lessonData.type as LessonType,
                  isPublished: status === 'PUBLISHED',
                  isFree: lessonData.isFree || false,
                  courseId: newCourse.id,
                  moduleId: newModule.id,
                }
              });
            }
          }
        }
      } else {
        // Create a default module and lesson if none provided
        const defaultModule = await tx.module.create({
          data: {
            title: 'Introduction',
            description: 'Welcome to the course',
            order: 1,
            courseId: newCourse.id,
            prerequisites: [],
          }
        });

        await tx.lesson.create({
          data: {
            title: 'Welcome to the Course',
            description: 'Course introduction and overview',
            content: 'Welcome! This is your first lesson.',
            order: 1,
            type: 'TEXT',
            isPublished: status === 'PUBLISHED',
            isFree: true,
            courseId: newCourse.id,
            moduleId: defaultModule.id,
          }
        });
      }

      return newCourse;
    });

    // Return the created course with basic info
    return NextResponse.json({
      id: course.id,
      title: course.title,
      slug: course.slug,
      status: course.status,
      message: status === 'PUBLISHED' 
        ? 'Course created and published successfully!' 
        : 'Course saved as draft successfully!'
    });

  } catch (error) {
    console.error('Error creating course:', error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A course with this title already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create course. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    });

    if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      instructorId: user.id,
    };

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }

    // Get courses with pagination
    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          modules: {
            include: {
              lessons: {
                select: { id: true }
              }
            }
          },
          enrollments: {
            select: { id: true, status: true }
          },
          _count: {
            select: {
              enrollments: true,
              reviews: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.course.count({ where })
    ]);

    // Format response data
    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      thumbnail: course.thumbnail,
      price: course.price,
      discountPrice: course.discountPrice,
      currency: course.currency,
      status: course.status,
      level: course.level,
      language: course.language,
      tags: course.tags,
      publishedAt: course.publishedAt,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      totalModules: course.modules.length,
      totalLessons: course.modules.reduce((total, module) => total + module.lessons.length, 0),
      totalEnrollments: course._count.enrollments,
      activeEnrollments: course.enrollments.filter(e => e.status === 'ACTIVE').length,
      averageRating: 0, // TODO: Calculate from reviews
      totalReviews: course._count.reviews
    }));

    return NextResponse.json({
      courses: formattedCourses,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}