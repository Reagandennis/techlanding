import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Auth Test Request ===');
    console.log('Request URL:', request.url);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Test auth() function
    const authResult = auth();
    console.log('auth() result:', authResult);
    
    // Test currentUser() function
    const user = await currentUser();
    console.log('currentUser() result:', user ? {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName
    } : null);
    
    return NextResponse.json({
      success: true,
      auth: {
        userId: authResult?.userId,
        sessionId: authResult?.sessionId,
        sessionClaims: authResult?.sessionClaims,
      },
      currentUser: user ? {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      } : null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      { 
        error: 'Auth test failed', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request); // Same test for POST
}