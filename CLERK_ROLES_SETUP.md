# 🎭 Clerk Role-Based Access Control Setup

## 🎯 Overview

I've created a comprehensive role-based access control system using Clerk's built-in metadata features. This approach is more secure and efficient than managing roles separately in your database.

## ✅ What's Been Created

### **Core Files Added:**

1. **`src/hooks/useRoleAccess.ts`** - Role access management hook
2. **`src/components/RoleSelection.tsx`** - Role selection interface
3. **`src/app/onboarding/page.tsx`** - Onboarding page with role selection
4. **`src/app/unauthorized/page.tsx`** - Access denied page
5. **`src/middleware-with-roles.ts`** - Enhanced middleware with role-based routing

### **Features Implemented:**

✅ **Role-based middleware** - Routes protected by user roles  
✅ **Role selection during onboarding** - Users choose their role  
✅ **Automatic dashboard redirects** - Users go to appropriate dashboards  
✅ **Access control hooks** - Easy role checking in components  
✅ **Higher-order components** - Wrap components with role protection  

## 🎭 Role System

### **Available Roles:**
- **👑 Admin** - Full platform access, user management
- **👨‍🏫 Instructor** - Course creation, student analytics  
- **🎓 Student** - Course access, progress tracking

### **Role Hierarchy:**
- **Admin** → Access to everything
- **Instructor** → Access to instructor + student features  
- **Student** → Access to student features only

## 🚀 Quick Setup

### **1. Update Your Middleware**

The new middleware is already configured but needs to be activated:

```bash
# The new middleware is ready to use
cp src/middleware-with-roles.ts src/middleware.ts
```

### **2. Set Up Role Selection**

Users will be redirected to `/onboarding` after signup where they can choose their role.

### **3. Update Your Environment**

Make sure your Clerk configuration in `.env.local` has the onboarding redirect:

```bash
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

## 📁 Route Protection

### **Public Routes (No Auth Required):**
```
/ 
/about
/contact  
/blog/*
/courses
/programs
/resources
/careers
/privacy
/terms
/sign-in/*
/sign-up/*
```

### **Admin Only Routes:**
```
/admin/*
/api/admin/*
```

### **Instructor Routes (Admin + Instructor):**
```
/instructor/*
/api/instructor/*
/create-course/*
/manage-courses/*
```

### **Student Routes (All Authenticated Users):**
```
/student/*
/api/student/*
/enrolled-courses/*
/my-progress/*
```

## 🛠 Using the Role System

### **1. Role Access Hook**

```tsx
import { useRoleAccess } from '@/hooks/useRoleAccess';

function MyComponent() {
  const { userRole, isAdmin, isInstructor, hasAccess } = useRoleAccess({
    requiredRole: 'instructor',
    redirectTo: '/unauthorized'
  });

  if (isAdmin) {
    return <AdminPanel />;
  }

  if (hasAccess(['instructor', 'admin'])) {
    return <InstructorContent />;
  }

  return <StudentContent />;
}
```

### **2. Higher-Order Component Protection**

```tsx
import { withRoleAccess } from '@/hooks/useRoleAccess';

const AdminComponent = withRoleAccess(YourComponent, {
  requiredRole: 'admin',
  redirectTo: '/unauthorized'
});
```

### **3. Role-Based Rendering**

```tsx
import { checkRoleAccess } from '@/hooks/useRoleAccess';

function Navigation() {
  const { userRole } = useRoleAccess({ requiredRole: 'student' });

  return (
    <nav>
      <Link href="/student/dashboard">Dashboard</Link>
      {checkRoleAccess(userRole, 'instructor') && (
        <Link href="/instructor/courses">My Courses</Link>
      )}
      {checkRoleAccess(userRole, 'admin') && (
        <Link href="/admin/users">Manage Users</Link>
      )}
    </nav>
  );
}
```

## 🔧 Dashboard System

### **Automatic Redirects**

Users are automatically redirected to appropriate dashboards:

- **Admin** → `/admin/dashboard`
- **Instructor** → `/instructor/dashboard`  
- **Student** → `/student/dashboard`

### **Dashboard Hook**

```tsx
import { useRoleDashboard } from '@/hooks/useRoleAccess';

function LoginButton() {
  const { redirectToDashboard, getDashboardUrl } = useRoleDashboard();

  return (
    <button onClick={redirectToDashboard}>
      Go to Dashboard
    </button>
  );
}
```

## 🎨 Role Selection Interface

The role selection component provides a beautiful interface for users to choose their role:

- **Visual role cards** with icons and feature lists
- **Real-time role updates** via Clerk metadata
- **Automatic redirects** after role selection
- **Loading states** and error handling

## 🔒 Security Features

### **Middleware Protection**
- Routes are protected at the middleware level
- Unauthorized access redirects to `/unauthorized`
- Role verification using Clerk session claims

### **Client-Side Protection**
- Components can check roles before rendering
- Higher-order components for route protection
- Graceful loading states and error handling

### **API Protection**
- API routes protected by role-based middleware
- Server-side role verification using Clerk auth

## 🚀 Testing the System

### **1. Test Role Selection**

1. Create a new user account
2. You'll be redirected to `/onboarding` 
3. Choose a role (Student or Instructor)
4. Get redirected to appropriate dashboard

### **2. Test Access Control**

1. Try accessing `/admin/users` as a student
2. Should redirect to `/unauthorized`
3. Try accessing instructor routes with student role
4. Should redirect to `/unauthorized`

### **3. Test Dashboard Redirects**

1. Go to `/lms` or `/dashboard`
2. Should automatically redirect based on your role
3. Admin → `/admin/dashboard`
4. Instructor → `/instructor/dashboard`
5. Student → `/student/dashboard`

## 📋 Next Steps

### **Create Dashboard Pages**

You'll need to create the actual dashboard pages:

```bash
src/app/admin/dashboard/page.tsx
src/app/instructor/dashboard/page.tsx  
src/app/student/dashboard/page.tsx
```

### **Update Navigation**

Update your main navigation to use role-based links:

```tsx
// Example navigation component
import { useRoleAccess } from '@/hooks/useRoleAccess';

export function MainNav() {
  const { userRole, isAdmin, isInstructor } = useRoleAccess({
    requiredRole: 'student'
  });

  return (
    <nav>
      {isAdmin && <Link href="/admin">Admin Panel</Link>}
      {isInstructor && <Link href="/instructor">My Courses</Link>}
      <Link href={`/${userRole}/dashboard`}>Dashboard</Link>
    </nav>
  );
}
```

### **Create Role-Specific Components**

Create components for each role:

- Admin: User management, system settings, analytics
- Instructor: Course creation, student management, earnings
- Student: Course enrollment, progress tracking, certificates

## 💡 Benefits of This Approach

✅ **Secure** - Roles managed by Clerk, not your database  
✅ **Fast** - No database queries needed for role checks  
✅ **Scalable** - Easy to add new roles and permissions  
✅ **User-Friendly** - Beautiful role selection interface  
✅ **Flexible** - Multiple ways to check and enforce roles  
✅ **Maintainable** - Centralized role logic in hooks  

## 🔄 Migration from Database Roles

If you want to migrate existing database roles to Clerk:

1. Create a migration script to read database roles
2. Update Clerk user metadata with the roles
3. Remove role columns from your database
4. Update existing components to use the new hooks

## 🎉 You're Ready!

Your role-based access control system is now complete and ready to use! 

**Key Benefits:**
- Users choose their roles during onboarding
- Routes are automatically protected by roles  
- Components can easily check user permissions
- Dashboards redirect based on user roles
- Unauthorized access is handled gracefully

---

**Next:** Create your dashboard pages and start building role-specific features!