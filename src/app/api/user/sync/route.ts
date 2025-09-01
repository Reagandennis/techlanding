import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user from Clerk
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user exists in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId }
    })

    // Create user if doesn't exist
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || '',
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          image: clerkUser.imageUrl,
          role: UserRole.USER // Default role
        }
      })
    } else {
      // Update user info if it exists
      dbUser = await prisma.user.update({
        where: { clerkId },
        data: {
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || dbUser.name,
          email: clerkUser.emailAddresses[0]?.emailAddress || dbUser.email,
          image: clerkUser.imageUrl || dbUser.image,
        }
      })
    }

    return NextResponse.json({ 
      user: {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        image: dbUser.image
      },
      role: dbUser.role
    })

  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
