
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await req.json()

    if (role !== 'STUDENT') {
      return NextResponse.json({ error: 'Invalid role requested' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.user.update({
      where: { clerkId },
      data: { role: UserRole.STUDENT },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error requesting access:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
