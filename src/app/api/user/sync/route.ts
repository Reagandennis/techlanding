import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserWithSync } from '@/lib/user-db-sync'

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use enhanced sync function
    const syncResult = await getCurrentUserWithSync()
    
    if (!syncResult) {
      return NextResponse.json({ error: 'User not found or sync failed' }, { status: 404 })
    }

    const { user, isNewUser } = syncResult

    return NextResponse.json({ 
      user,
      role: user.role,
      isNewUser,
      message: isNewUser ? 'User created and synced' : 'User synced successfully'
    })

  } catch (error) {
    console.error('❌ Error syncing user:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    )
  }
}
