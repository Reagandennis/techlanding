# TechGetAfrica Migration Guide: Clerk + Prisma + Postgres → Supabase

This guide provides step-by-step instructions to migrate your application from Clerk Auth + Prisma + Postgres to Supabase.

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [Pre-Migration Setup](#pre-migration-setup)
3. [Database Migration](#database-migration)
4. [Authentication Migration](#authentication-migration)
5. [Code Updates](#code-updates)
6. [Cleanup](#cleanup)
7. [Testing](#testing)
8. [Deployment](#deployment)

## Migration Overview

### What's Changing:
- **Authentication**: Clerk → Supabase Auth
- **Database**: Self-managed Postgres → Supabase Postgres
- **User Management**: Clerk Users → Supabase auth.users + profiles table
- **Authorization**: Clerk roles → Custom role-based system with RLS

### What's Preserved:
- All user data and course content
- Existing database structure (with modifications)
- Role-based access control (STUDENT, INSTRUCTOR, ADMIN)

## Pre-Migration Setup

### 1. Backup Your Current Database

```bash
# Create a backup of your current database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project details:
   - Project URL: `https://wqacmemtnwezwbguimtn.supabase.co`
   - Anon Key: `sb_publishable_Dv5de70TPf3tAkwZQKLBvA_UhrvTsy3`
   - Service Role Key: `sb_secret_qxY0FtMdVnxtfBiZ-RdF4w_bCR_GhzV`

### 3. Install Supabase Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Database Migration

### Option 1: Fresh Start with SQL Migration

1. Run the migration script in Supabase SQL Editor:

```bash
# Copy the migration.sql content to Supabase SQL Editor
cat supabase/migration.sql
```

2. Run the advanced policies:

```bash
# Copy the advanced-policies.sql content to Supabase SQL Editor
cat supabase/advanced-policies.sql
```

### Option 2: Keep Prisma with Supabase

If you want to continue using Prisma:

1. Update your database URL to point to Supabase:

```bash
# In .env.local
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.wqacmemtnwezwbguimtn.supabase.co:5432/postgres"
```

2. Replace your current Prisma schema:

```bash
# Backup current schema
cp prisma/schema.prisma prisma/schema.prisma.backup

# Use the new Supabase-compatible schema
cp prisma/schema-supabase.prisma prisma/schema.prisma
```

3. Generate and push the schema:

```bash
npx prisma generate
npx prisma db push
```

## Authentication Migration

### 1. Update Environment Variables

Replace your `.env.local` file with the new Supabase configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wqacmemtnwezwbguimtn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Dv5de70TPf3tAkwZQKLBvA_UhrvTsy3
SUPABASE_SERVICE_ROLE_KEY=sb_secret_qxY0FtMdVnxtfBiZ-RdF4w_bCR_GhzV

# Auth URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Keep other environment variables (Cloudinary, Paystack, etc.)
```

### 2. Update Your App Layout

Replace Clerk providers with Supabase:

```tsx
// src/app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 3. Create Auth Callback Route

```tsx
// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/lms/student'

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
```

## Code Updates

### 1. Replace Clerk Hooks

**Before (Clerk):**
```tsx
import { useUser } from '@clerk/nextjs'

function Component() {
  const { user, isLoaded } = useUser()
  
  if (!isLoaded) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>
  
  return <div>Hello {user.firstName}</div>
}
```

**After (Supabase):**
```tsx
import { useAuth } from '@/contexts/AuthContext'

function Component() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>
  
  return <div>Hello {user.profile.first_name}</div>
}
```

### 2. Replace Role Checks

**Before (Clerk):**
```tsx
import { useUser } from '@clerk/nextjs'

function AdminComponent() {
  const { user } = useUser()
  
  if (user?.publicMetadata?.role !== 'ADMIN') {
    return <div>Access denied</div>
  }
  
  return <div>Admin content</div>
}
```

**After (Supabase):**
```tsx
import { useAuth } from '@/contexts/AuthContext'

function AdminComponent() {
  const { user, isAdmin } = useAuth()
  
  if (!isAdmin()) {
    return <div>Access denied</div>
  }
  
  return <div>Admin content</div>
}
```

### 3. Update Auth Pages

Replace your auth pages with the new Supabase components:

```tsx
// src/app/auth/sign-in/page.tsx
import SignInForm from '@/components/auth/SignInForm'

export default function SignInPage() {
  return <SignInForm />
}
```

```tsx
// src/app/auth/sign-up/page.tsx
import SignUpForm from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return <SignUpForm />
}
```

### 4. Update API Routes

**Before (Clerk):**
```tsx
import { auth } from '@clerk/nextjs'

export async function GET() {
  const { userId } = auth()
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // API logic
}
```

**After (Supabase):**
```tsx
import { withAuth } from '@/lib/supabase-auth'

export const GET = withAuth(async (req, user) => {
  // API logic with authenticated user
  return Response.json({ user: user.profile })
})
```

## Cleanup

### 1. Remove Clerk Dependencies

```bash
npm uninstall @clerk/nextjs @clerk/themes
```

### 2. Remove Clerk Environment Variables

Remove these from `.env.local`:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- `CLERK_WEBHOOK_SECRET`

### 3. Update Middleware Config

The new middleware configuration is already in place. Make sure the `config` export is updated:

```tsx
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

### 4. Remove Clerk-Specific Files

```bash
rm -rf src/components/ClerkLayoutWrapper.tsx
# Remove any other Clerk-specific components you may have
```

### 5. Update Imports Throughout Codebase

Search and replace these imports across your codebase:

```bash
# Find Clerk imports
grep -r "@clerk" src/

# Replace with appropriate Supabase imports
# @clerk/nextjs → @/contexts/AuthContext (for useAuth)
# useUser() → useAuth()
# useAuth() → useAuth() (different implementation)
```

## Data Migration

### Migrating User Data from Clerk to Supabase

If you need to migrate existing user data:

1. **Export Clerk Users** (if you have existing users):
   - Use Clerk's API to export user data
   - Create a migration script to map Clerk users to Supabase profiles

2. **Example Migration Script**:

```tsx
// src/scripts/migrate-users.ts
import { createClient } from '@supabase/supabase-js'
import { clerkClient } from '@clerk/nextjs'

async function migrateUsers() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get users from Clerk
  const clerkUsers = await clerkClient.users.getUserList()

  for (const clerkUser of clerkUsers) {
    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: clerkUser.emailAddresses[0]?.emailAddress,
      password: generateTempPassword(), // You'll need to handle this
      email_confirm: true,
      user_metadata: {
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName
      }
    })

    if (authError) {
      console.error('Error creating user:', authError)
      continue
    }

    // Create profile in profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        role: clerkUser.publicMetadata.role || 'STUDENT'
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
    }
  }
}
```

## Testing

### 1. Test Authentication Flow

1. **Sign Up**: Test new user registration
2. **Sign In**: Test existing user login
3. **Role Assignment**: Verify STUDENT role is assigned by default
4. **Password Reset**: Test forgot password flow
5. **Social Login**: Test Google/GitHub authentication (if enabled)

### 2. Test Authorization

1. **Student Access**: Verify students can only access student routes
2. **Instructor Access**: Verify instructors can access instructor routes
3. **Admin Access**: Verify admins can access all routes
4. **API Protection**: Test API routes with different roles

### 3. Test Database Operations

1. **Profile Updates**: Test updating user profiles
2. **Course Creation**: Test instructor course creation
3. **Enrollment**: Test student course enrollment
4. **Progress Tracking**: Test lesson completion tracking

## Deployment

### 1. Production Environment Variables

Update your production environment with Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wqacmemtnwezwbguimtn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Dv5de70TPf3tAkwZQKLBvA_UhrvTsy3
SUPABASE_SERVICE_ROLE_KEY=sb_secret_qxY0FtMdVnxtfBiZ-RdF4w_bCR_GhzV
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. Update Supabase Auth Settings

In your Supabase dashboard:

1. **Authentication → Settings**:
   - Set site URL to your production domain
   - Configure redirect URLs for OAuth providers
   - Set up custom SMTP (optional)

2. **Authentication → URL Configuration**:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: 
     - `https://your-domain.com/auth/callback`
     - `http://localhost:3000/auth/callback` (for development)

### 3. Deploy and Test

1. Deploy your application with the new Supabase integration
2. Test the complete authentication flow in production
3. Monitor error logs for any migration issues

## Troubleshooting

### Common Issues

1. **"User not found" errors**: Ensure the trigger function is properly creating profiles
2. **Permission denied**: Check RLS policies are correctly configured
3. **Redirect loops**: Verify middleware configuration and auth callback setup
4. **Session issues**: Check cookie settings and middleware client creation

### Rollback Plan

If you need to rollback:

1. Keep your original database backup
2. Restore Clerk environment variables
3. Reinstall Clerk dependencies
4. Revert code changes using git

## Support

For issues during migration:

1. Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Review the generated files in this migration
3. Test each component individually before full integration

## Example User Signup Flow

Here's how a new user signup works with the new system:

1. **User submits signup form**
2. **Supabase Auth creates user** in `auth.users` table
3. **Trigger automatically creates profile** in `profiles` table with default STUDENT role
4. **User receives email verification** (if enabled)
5. **User can sign in** and access student dashboard
6. **Admin can later change role** to INSTRUCTOR or ADMIN if needed

The migration preserves all your existing functionality while providing a more integrated and powerful authentication system with Supabase.