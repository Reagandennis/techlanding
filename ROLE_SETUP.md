# 🛠️ Role Setup Guide

This guide will help you set up admin and instructor accounts for your LMS application.

## Prerequisites

1. ✅ Application is running (`npm run dev`)
2. ✅ Database is connected and migrated
3. ✅ Clerk authentication is configured
4. ✅ You have at least one user account created via sign-up

## Method 1: Web Interface (Recommended)

### Step 1: Access the Role Setup Page
Visit: **http://localhost:3000/dev/set-roles**

### Step 2: Get Your Clerk User ID
1. Sign into the application with the account you want to make admin/instructor
2. The setup page will show your Clerk ID automatically
3. Click "Use My Info" to auto-populate the form

### Step 3: Set the Role
1. Select the desired role:
   - **👑 ADMIN**: Full platform access, analytics, user management
   - **👨‍🏫 INSTRUCTOR**: Course creation, instructor analytics
   - **👨‍🎓 STUDENT**: Standard student access (default)

2. Fill in name and email (optional)
3. Click "Set Role"

### Step 4: Test Access
- **Admin**: Visit `/admin/analytics`
- **Instructor**: Visit `/lms/instructor` or `/instructor/analytics` 
- **Student**: Visit `/dashboard/student`

## Method 2: Command Line Script

### Step 1: Run the Setup Script
```bash
node scripts/setup-roles.js
```

### Step 2: Follow the Prompts
1. Enter the Clerk User ID (starts with `user_`)
2. Select role (1=Student, 2=Instructor, 3=Admin)
3. Enter name and email (optional)

## Method 3: Direct API Call

### Using curl:
```bash
curl -X POST http://localhost:3000/api/admin/set-role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN" \
  -d '{
    "targetClerkId": "user_2ABC123XYZ",
    "role": "ADMIN",
    "name": "Admin User",
    "email": "admin@example.com"
  }'
```

## Finding Clerk User IDs

### Method 1: From the Setup Page
1. Sign in as the target user
2. Visit `/dev/set-roles`
3. Your Clerk ID will be displayed

### Method 2: Browser Developer Tools
1. Sign in as the target user
2. Open browser dev tools (F12)
3. Go to Console tab
4. Type: `window.__clerk?.user?.id`

### Method 3: Clerk Dashboard
1. Visit your Clerk dashboard
2. Go to Users section
3. Find the user and copy their ID

## Quick Setup for Common Scenarios

### Scenario 1: Make Yourself Admin
1. Sign up for an account
2. Visit `/dev/set-roles`
3. Click "Use My Info"
4. Select "👑 Admin"
5. Click "Set Role"

### Scenario 2: Create Instructor Accounts
1. Have the instructor sign up first
2. Get their Clerk ID
3. Use any method above to set their role to "INSTRUCTOR"

## Dashboard URLs After Setup

- **👑 Admin Analytics**: `/admin/analytics`
- **👨‍🏫 Instructor Dashboard**: `/lms/instructor`
- **📊 Instructor Analytics**: `/instructor/analytics` 
- **👨‍🎓 Student Dashboard**: `/dashboard/student`

## Security Note

⚠️ **Important**: The admin role check is currently disabled for initial setup. After creating your admin accounts, you should:

1. Re-enable the admin check in `/src/app/api/admin/set-role/route.ts`
2. Uncomment lines 24-29 in that file
3. Remove or protect the `/dev/set-roles` page in production

## Troubleshooting

### Issue: "Only admins can set user roles" error
- The admin check is still enabled. Follow the security note above to disable it temporarily.

### Issue: "Unauthorized" error  
- Make sure you're signed in when making API calls or using the web interface.

### Issue: User not found after role change
- Try signing out and signing back in
- Check the database to verify the role was set correctly

### Issue: Can't access admin/instructor pages
- Verify the role was set correctly in the database
- Clear browser cache and cookies
- Make sure you're signed in as the correct user

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check the server logs in your terminal
3. Verify your database connection
4. Ensure Clerk configuration is correct