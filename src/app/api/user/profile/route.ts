import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'
import { protectApiRoute } from '@/lib/auth'

export async function GET() {
  const authCheck = await protectApiRoute()
  
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: authCheck.userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        image: true,
        role: true,
        bio: true,
        skillLevel: true,
        learningGoals: true,
        interests: true,
        totalPoints: true,
        currentStreak: true,
        longestStreak: true,
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            createdCourses: true,
            certificates: true,
            achievements: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const authCheck = await protectApiRoute()
  
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }

  try {
    const data = await request.json()
    
    // Validate and sanitize the data
    const allowedFields = [
      'firstName',
      'lastName', 
      'bio',
      'skillLevel',
      'learningGoals',
      'interests',
      'linkedinUrl',
      'twitterUrl',
      'githubUrl',
      'websiteUrl',
      'timezone',
      'language',
      'emailNotifications',
      'pushNotifications',
      'marketingEmails'
    ]
    
    const updateData = {}
    for (const field of allowedFields) {
      if (data.hasOwnProperty(field)) {
        updateData[field] = data[field]
      }
    }

    // Update name if firstName or lastName changed
    if (data.firstName || data.lastName) {
      const user = await prisma.user.findUnique({
        where: { clerkId: authCheck.userId },
        select: { firstName: true, lastName: true }
      })
      
      const newFirstName = data.firstName || user?.firstName || ''
      const newLastName = data.lastName || user?.lastName || ''
      updateData['name'] = `${newFirstName} ${newLastName}`.trim()
    }

    const updatedUser = await prisma.user.update({
      where: { clerkId: authCheck.userId },
      data: updateData,
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        image: true,
        role: true,
        bio: true,
        skillLevel: true,
        learningGoals: true,
        interests: true,
        totalPoints: true,
        currentStreak: true,
        longestStreak: true,
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}