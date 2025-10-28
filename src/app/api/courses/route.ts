import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'PUBLISHED';

    // Build filter conditions
    const where: any = {
      status: status as any
    };

    if (category) {
      where.categories = {
        some: {
          categoryId: category
        }
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true
          }
        },
        // Include enrollment info if user is authenticated
        ...(user && {
          enrollments: {
            where: {
              user: {
                clerkId: user.id
              }
            },
            select: {
              id: true,
              status: true,
              progress: true,
              paymentStatus: true
            }
          }
        })
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Process courses to add enrollment information
    const coursesWithEnrollmentInfo = courses.map(course => {
      const enrollment = course.enrollments?.[0];
      
      return {
        ...course,
        isEnrolled: !!enrollment,
        canAccess: enrollment?.paymentStatus === 'PAID' || course.price === 0,
        paymentStatus: enrollment?.paymentStatus || null,
        userProgress: enrollment?.progress || 0,
        enrollments: undefined // Remove from response
      };
    });

    return NextResponse.json({ 
      courses: coursesWithEnrollmentInfo,
      total: courses.length 
    });
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is instructor or admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser || !['INSTRUCTOR', 'ADMIN'].includes(dbUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, price, thumbnail, categoryIds } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: price || 0,
        thumbnail,
        instructorId: dbUser.id,
        ...(categoryIds && categoryIds.length > 0 && {
          categories: {
            create: categoryIds.map((categoryId: string) => ({
              categoryId
            }))
          }
        })
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true
          }
        }
      }
    });

    return NextResponse.json({ course }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
