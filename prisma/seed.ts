import { PrismaClient, UserRole, CourseStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create or find instructor user
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@techgetafrica.com' },
    update: {},
    create: {
      email: 'instructor@techgetafrica.com',
      name: 'Default Instructor',
      role: UserRole.INSTRUCTOR,
      image: '/images/avatar-instructor.png'
    }
  })

  // Categories
  const categories = await prisma.$transaction([
    prisma.category.upsert({
      where: { name: 'Cloud' },
      update: {},
      create: { name: 'Cloud', description: 'Cloud & Infrastructure' },
    }),
    prisma.category.upsert({
      where: { name: 'Security' },
      update: {},
      create: { name: 'Security', description: 'Cybersecurity & Compliance' },
    }),
    prisma.category.upsert({
      where: { name: 'DevOps' },
      update: {},
      create: { name: 'DevOps', description: 'CI/CD & Automation' },
    }),
  ])

  // Courses
  const courseData = [
    {
      title: 'AWS Cloud Practitioner',
      description: 'Learn the fundamentals of AWS Cloud and prepare for the CLF-C02 exam.',
      price: 0,
      thumbnail: '/images/courses/aws.png',
      categories: ['Cloud'],
    },
    {
      title: 'CompTIA Security+',
      description: 'Master core cybersecurity skills and pass the Security+ exam.',
      price: 0,
      thumbnail: '/images/courses/securityplus.png',
      categories: ['Security'],
    },
    {
      title: 'Docker & Kubernetes Basics',
      description: 'Containerization and orchestration essentials for modern DevOps.',
      price: 0,
      thumbnail: '/images/courses/kubernetes.png',
      categories: ['DevOps'],
    },
  ]

  for (const c of courseData) {
    // find by title (non-unique), then create if missing
    let course = await prisma.course.findFirst({ where: { title: c.title } })
    if (!course) {
      course = await prisma.course.create({
        data: {
          title: c.title,
          description: c.description,
          price: c.price,
          thumbnail: c.thumbnail,
          status: CourseStatus.PUBLISHED,
          instructorId: instructor.id,
        },
      })
    }

    // attach categories idempotently
    const catIds = categories
      .filter(cat => c.categories.includes(cat.name))
      .map(cat => cat.id)

    for (const catId of catIds) {
      await prisma.courseCategory.upsert({
        where: { courseId_categoryId: { courseId: course.id, categoryId: catId } },
        update: {},
        create: { courseId: course.id, categoryId: catId },
      })
    }
  }

  console.log('Seed completed')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


