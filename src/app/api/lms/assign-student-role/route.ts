import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find the user in your database using clerkId
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // If user doesn't exist in your DB, it might be a new sign-up.
      // You might want to create the user here or ensure user-sync webhook handles it.
      // For now, let's assume user-sync has already created the user.
      // If not, this would be a good place to trigger user creation or return an error.
      return new NextResponse('User not found in database. Ensure user synchronization is working.', { status: 404 });
    }

    // If the user is already a student, no action needed (idempotency)
    if (user.role === UserRole.STUDENT) {
      return NextResponse.json({ message: 'User is already a student.', userRole: UserRole.STUDENT });
    }

    // Update the user's role to STUDENT
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.STUDENT },
    });

    return NextResponse.json({ message: 'User role updated to STUDENT successfully.', userRole: user.role });
  } catch (error) {
    console.error('[ASSIGN_STUDENT_ROLE_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
