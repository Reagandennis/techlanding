import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = auth()
    
    return NextResponse.json({ 
      isAuthenticated: !!userId,
      userId: userId || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check auth',
      isAuthenticated: false 
    }, { status: 500 })
  }
}