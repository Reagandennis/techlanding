
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { QuizAttempt } from '@prisma/client'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = auth()
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const quizId = params.id
    const attemptData = (await req.json()) as Omit<QuizAttempt, 'id' | 'completedAt'>

    const latestAttempt = await prisma.quizAttempt.findFirst({
        where: {
            quizId: quizId,
            userId: dbUser.id,
        },
        orderBy: {
            attemptNumber: 'desc',
        },
    });

    const newAttemptNumber = latestAttempt ? latestAttempt.attemptNumber + 1 : 1;

    const newAttempt = await prisma.quizAttempt.create({
      data: {
        ...attemptData,
        userId: dbUser.id,
        quizId: quizId,
        attemptNumber: newAttemptNumber,
        completedAt: new Date(),
      },
    })

    return NextResponse.json(newAttempt)
  } catch (error) {
    console.error('Error submitting quiz attempt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
