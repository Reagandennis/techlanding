// Script to seed initial LMS data for testing
// Run this with: node scripts/seed-lms-data.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedLMSData() {
  try {
    console.log('🌱 Seeding LMS data...');

    // Create categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Web Development' },
        update: {},
        create: {
          name: 'Web Development',
          description: 'Learn modern web development technologies'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Mobile Development' },
        update: {},
        create: {
          name: 'Mobile Development',
          description: 'Build mobile applications for iOS and Android'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Data Science' },
        update: {},
        create: {
          name: 'Data Science',
          description: 'Master data analysis and machine learning'
        }
      })
    ]);

    console.log('✅ Categories created:', categories.length);

    // Create badges
    const badges = await Promise.all([
      prisma.badge.upsert({
        where: { name: 'Course Completion' },
        update: {},
        create: {
          name: 'Course Completion',
          description: 'Complete your first course',
          type: 'COMPLETION',
          criteria: { completedCourses: 1 },
          points: 50
        }
      }),
      prisma.badge.upsert({
        where: { name: 'Quiz Master' },
        update: {},
        create: {
          name: 'Quiz Master',
          description: 'Score 100% on a quiz',
          type: 'MASTERY',
          criteria: { perfectQuizScore: true },
          points: 100
        }
      }),
      prisma.badge.upsert({
        where: { name: 'Learning Streak' },
        update: {},
        create: {
          name: 'Learning Streak',
          description: 'Study for 7 consecutive days',
          type: 'STREAK',
          criteria: { consecutiveDays: 7 },
          points: 200
        }
      })
    ]);

    console.log('✅ Badges created:', badges.length);

    // Find or create an instructor user (you'll need to update the clerkId)
    const instructorClerkId = process.env.INSTRUCTOR_CLERK_ID || 'instructor-clerk-id-placeholder';
    
    const instructor = await prisma.user.upsert({
      where: { clerkId: instructorClerkId },
      update: {},
      create: {
        clerkId: instructorClerkId,
        name: 'Tech Instructor',
        email: 'instructor@techgetafrica.com',
        role: 'INSTRUCTOR',
        bio: 'Experienced software developer and instructor with 10+ years in the industry.'
      }
    });

    console.log('✅ Instructor user created:', instructor.email);

    // Create sample courses
    const courses = [
      {
        title: 'Introduction to React Development',
        description: 'Learn the fundamentals of React.js and build modern web applications. This comprehensive course covers components, state management, hooks, and best practices.',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        price: 99.99,
        status: 'PUBLISHED',
        instructorId: instructor.id,
        lessons: [
          {
            title: 'What is React?',
            description: 'Introduction to React and its ecosystem',
            content: 'React is a JavaScript library for building user interfaces...',
            order: 1,
            type: 'TEXT',
            isPublished: true
          },
          {
            title: 'Setting up Your Development Environment',
            description: 'Install Node.js, React, and development tools',
            content: 'In this lesson, we will set up everything you need...',
            order: 2,
            type: 'TEXT',
            isPublished: true
          },
          {
            title: 'Your First React Component',
            description: 'Create and understand React components',
            content: 'Components are the building blocks of React applications...',
            order: 3,
            type: 'TEXT',
            isPublished: true
          }
        ]
      },
      {
        title: 'Python for Data Science',
        description: 'Master data analysis, visualization, and machine learning with Python. Learn pandas, NumPy, matplotlib, and scikit-learn.',
        thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
        price: 149.99,
        status: 'PUBLISHED',
        instructorId: instructor.id,
        lessons: [
          {
            title: 'Python Basics for Data Science',
            description: 'Essential Python concepts for data analysis',
            content: 'Python is one of the most popular languages for data science...',
            order: 1,
            type: 'TEXT',
            isPublished: true
          },
          {
            title: 'Introduction to Pandas',
            description: 'Data manipulation with pandas library',
            content: 'Pandas is the go-to library for data manipulation in Python...',
            order: 2,
            type: 'TEXT',
            isPublished: true
          }
        ]
      },
      {
        title: 'Mobile App Development with Flutter',
        description: 'Build cross-platform mobile apps with Flutter and Dart. Create beautiful, natively compiled applications.',
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
        price: 199.99,
        status: 'DRAFT',
        instructorId: instructor.id,
        lessons: [
          {
            title: 'Getting Started with Flutter',
            description: 'Install Flutter and create your first app',
            content: 'Flutter is Google\'s UI toolkit for building apps...',
            order: 1,
            type: 'TEXT',
            isPublished: false
          }
        ]
      }
    ];

    for (const courseData of courses) {
      const { lessons, ...courseInfo } = courseData;
      
      const course = await prisma.course.create({
        data: {
          ...courseInfo,
          lessons: {
            create: lessons
          }
        }
      });

      // Link course to categories
      await prisma.courseCategory.create({
        data: {
          courseId: course.id,
          categoryId: categories[0].id // Web Development category
        }
      });

      console.log(`✅ Course created: ${course.title}`);
    }

    console.log('\\n🎉 LMS data seeded successfully!');
    console.log('\\n📚 You can now test the LMS with:');
    console.log('   • 3 courses (2 published, 1 draft)');
    console.log('   • 3 categories');
    console.log('   • 3 badges');
    console.log('   • 1 instructor user');
    
  } catch (error) {
    console.error('❌ Error seeding LMS data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLMSData();
