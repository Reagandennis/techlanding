import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Database Test Request ===');
    
    // Test database connection
    const userCount = await prisma.user.count();
    console.log('User count from database:', userCount);
    
    // Get some sample users
    const sampleUsers = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('Sample users:', sampleUsers);
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        userCount,
        sampleUsers,
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        error: 'Database test failed', 
        details: error.message,
        database: {
          connected: false,
        }
      },
      { status: 500 }
    );
  }
}