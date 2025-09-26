import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Enhanced Prisma Client for production LMS
export const prisma = globalThis.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'minimal',
});

// Connection pool optimization
// Ensure Prisma Client is properly closed on app termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Database utility functions
export async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error: any) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
}

// Enhanced query helpers for LMS
export const dbHelpers = {
  async getUserWithProfile(clerkId: string) {
    return await prisma.user.findUnique({
      where: { clerkId },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
                progress: {
                  where: { 
                    user: {
                      clerkId: clerkId
                    }
                  }
                }
              }
            }
          }
        },
        certificates: true,
        achievements: true,
      }
    });
  },
  
  async getCourseWithProgress(courseId: string, userId?: string) {
    return await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            bio: true,
          }
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: userId ? {
                progress: {
                  where: { userId },
                  select: {
                    completed: true,
                    watchTime: true,
                    completedAt: true,
                  }
                }
              } : false
            }
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          }
        }
      }
    });
  },
  
  async getEnrollmentWithProgress(userId: string, courseId: string) {
    return await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      include: {
        course: {
          include: {
            lessons: {
              include: {
                progress: {
                  where: { userId },
                  select: {
                    completed: true,
                    watchTime: true,
                    completedAt: true,
                  }
                }
              }
            }
          }
        },
        progress: true
      }
    });
  }
};
