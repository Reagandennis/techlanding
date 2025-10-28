# 🔐 Supabase Role-Based Access Control Setup

This guide will help you set up instructor and administrator accounts with proper role restrictions using Supabase.

## 📋 Prerequisites

1. ✅ Supabase project is set up and connected
2. ✅ Database schema is migrated with Prisma
3. ✅ Authentication is configured

## 🚀 Step-by-Step Setup

### Step 1: Run the Role Setup SQL

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase/role-setup.sql`
4. Click **Run** to execute the script

This will:
- Enable Row Level Security (RLS) on all tables
- Create role-based access policies
- Set up utility functions for role checking
- Configure proper permissions

### Step 2: Set Up Test Accounts

Make sure you have the required environment variables in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Then run the account setup script:

```bash
node scripts/setup-test-accounts.js
```

This will create three test accounts:
- **Admin**: `admin@techgetafrica.com` (password: `TestAdmin123!`)
- **Instructor**: `instructor@techgetafrica.com` (password: `TestInstructor123!`)
- **Student**: `student@techgetafrica.com` (password: `TestStudent123!`)

### Step 3: Run the Auth Integration SQL

1. In **Supabase SQL Editor**
2. Copy and paste the contents of `supabase/auth-integration.sql`
3. Click **Run** to execute

This sets up:
- Automatic profile creation on user signup
- Profile management triggers
- Additional RLS policies

### Step 4: Test Role-Based Access

1. Start your development server:
```bash
npm run dev
```

2. Visit `http://localhost:3002` and test the following:

**Admin Access:**
- Login: `admin@techgetafrica.com`
- Should access: `/admin`, `/admin/users`, `/admin/analytics`
- Should be redirected from `/lms` to `/admin`

**Instructor Access:**
- Login: `instructor@techgetafrica.com`
- Should access: `/instructor`, `/instructor/courses`
- Should be denied: `/admin` (redirected to `/unauthorized`)

**Student Access:**
- Login: `student@techgetafrica.com`
- Should access: `/student`, `/student/courses`
- Should be denied: `/admin`, `/instructor` (redirected to `/unauthorized`)

## 🛡️ Role-Based Restrictions

### Route Protection

The middleware automatically protects these routes:

| Route Pattern | Required Role | Description |
|---------------|---------------|-------------|
| `/admin/*` | ADMIN | Admin dashboard and management |
| `/instructor/*` | INSTRUCTOR or ADMIN | Instructor features |
| `/student/*` | Any authenticated user | Student features |
| `/lms/*` | Any authenticated user | General LMS access |

### Database Security

Row Level Security (RLS) policies ensure:

- **Profiles**: Users can only see/edit their own profile; admins can manage all profiles
- **Courses**: Only published courses are public; instructors manage their own courses
- **Enrollments**: Users see their own enrollments; instructors see their course enrollments
- **Progress**: Users manage their own progress; instructors see student progress

### API Protection

API routes are protected with:
- Header-based role checking (`x-user-role` header)
- User ID verification (`x-user-id` header)
- Automatic role validation in middleware

## 🔧 Customizing Roles

### Adding New Roles

1. **Update the Prisma schema** (`prisma/schema.prisma`):
```prisma
enum Role {
  STUDENT
  INSTRUCTOR
  ADMIN
  MODERATOR  // New role
}
```

2. **Update middleware** (`src/middleware.ts`):
```typescript
const PROTECTED_ROUTES = {
  // ... existing routes
  MODERATOR: [
    '/moderator',
    '/api/moderator'
  ]
}
```

3. **Add to role setup SQL**:
```sql
-- Add new policies for MODERATOR role
CREATE POLICY "Moderators can moderate content" 
ON public."Course" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('MODERATOR', 'ADMIN')
  )
);
```

### Managing User Roles

#### Via Supabase Dashboard
1. Go to **Authentication** > **Users**
2. Click on a user
3. Edit **User Metadata** and add:
```json
{
  "role": "INSTRUCTOR"
}
```

#### Via SQL Function
Use the built-in function:
```sql
SELECT public.setup_user_role('user@example.com', 'INSTRUCTOR');
```

#### Programmatically
Create an API endpoint to update roles:
```typescript
// /api/admin/update-role
const { data, error } = await supabase
  .from('profiles')
  .update({ role: 'INSTRUCTOR' })
  .eq('id', userId);
```

## 🚨 Security Best Practices

1. **Never store roles client-side** - Always verify server-side
2. **Use RLS policies** - Protect data at the database level
3. **Validate permissions** - Check roles in every protected API endpoint
4. **Audit access** - Log role changes and access attempts
5. **Rotate credentials** - Change test account passwords in production

## 🐛 Troubleshooting

### Common Issues

**"Access Denied" for valid users:**
- Check if the user has a profile in the `profiles` table
- Verify the role is set correctly
- Ensure RLS policies are applied

**Middleware not working:**
- Verify Supabase environment variables
- Check that middleware is properly configured
- Look for console errors in browser/server

**Test accounts not created:**
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set
- Check Supabase logs for errors
- Verify email confirmation is disabled for test accounts

### Debug Commands

Check user role:
```sql
SELECT id, email, role FROM profiles WHERE email = 'user@example.com';
```

List all policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

Test RLS:
```sql
SET LOCAL role TO authenticated;
SET LOCAL "request.jwt.claim.sub" TO 'user-uuid-here';
SELECT * FROM profiles; -- Should only show accessible profiles
```

## 📚 Additional Resources

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)

## 🎯 Next Steps

After setup is complete:

1. **Test all user flows** with different roles
2. **Update existing components** to use role-based access
3. **Implement role-specific features** in your dashboards
4. **Set up proper logging** for security auditing
5. **Deploy with production credentials**

---

🔒 **Security Note**: These are test credentials. Always use strong, unique passwords in production and enable proper email verification.