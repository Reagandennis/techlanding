# TechGetAfrica LMS Setup Guide

## 🚀 Quick Start - Accessing Your LMS

Your LMS is now deployed at: **https://techgetafrica.com**

### 1. Get Your Clerk User ID

#### Method 1: From Clerk Dashboard
1. Visit [Clerk Dashboard](https://dashboard.clerk.com/)
2. Go to your app → Users section
3. Find your user and copy the User ID (format: `user_2ABC123XYZ`)

#### Method 2: From Your Website
1. Visit https://techgetafrica.com and sign in
2. Open browser dev tools (F12)
3. In console, type: `window.Clerk?.user?.id`
4. Copy the returned user ID

### 2. Set Your Role (Run on your server)

Replace `YOUR_CLERK_ID` with your actual Clerk user ID:

```bash
# For Admin access (full control)
CLERK_USER_ID="YOUR_CLERK_ID" USER_ROLE="ADMIN" node scripts/set-user-role.js

# For Instructor access (can create/manage courses)
CLERK_USER_ID="YOUR_CLERK_ID" USER_ROLE="INSTRUCTOR" node scripts/set-user-role.js

# For Student access (can enroll in courses)
CLERK_USER_ID="YOUR_CLERK_ID" USER_ROLE="USER" node scripts/set-user-role.js
```

### 3. Seed Initial LMS Data (Optional)

To get sample courses, categories, and badges for testing:

```bash
# Creates sample courses and data
INSTRUCTOR_CLERK_ID="YOUR_CLERK_ID" node scripts/seed-lms-data.js
```

## 🎯 Access URLs by Role

### 👨‍🎓 **Student (USER Role)**
- **Homepage**: https://techgetafrica.com/
- **Browse Courses**: https://techgetafrica.com/lms/courses
- **My Enrollments**: https://techgetafrica.com/lms/my-courses
- **Badges & Achievements**: https://techgetafrica.com/lms/badges
- **Profile**: https://techgetafrica.com/profile

### 👩‍🏫 **Instructor Role**
All student URLs plus:
- **Instructor Dashboard**: https://techgetafrica.com/instructor/dashboard
- **Create Course**: https://techgetafrica.com/instructor/courses/create
- **Manage My Courses**: https://techgetafrica.com/instructor/courses
- **Student Progress**: https://techgetafrica.com/instructor/analytics

### 🔧 **Admin Role**
All instructor URLs plus:
- **Admin Panel**: https://techgetafrica.com/admin
- **User Management**: https://techgetafrica.com/admin/users
- **Course Management**: https://techgetafrica.com/admin/courses
- **System Analytics**: https://techgetafrica.com/admin/analytics

## 🎯 LMS Features by Role

### Student Features
- ✅ Browse and search courses
- ✅ Enroll in courses (free or paid)
- ✅ Take lessons and track progress
- ✅ Take quizzes and see results
- ✅ Earn badges and achievements
- ✅ View certificates
- ✅ Access course materials

### Instructor Features
- ✅ Create and manage courses
- ✅ Add lessons (text, video, quiz)
- ✅ Create quizzes and assignments
- ✅ Monitor student progress
- ✅ Manage course access codes
- ✅ View course analytics

### Admin Features
- ✅ Full system control
- ✅ Manage all users and roles
- ✅ Approve/reject courses
- ✅ System-wide analytics
- ✅ Badge and certificate management

## 🧪 Testing Your LMS

1. **As Student**: 
   - Visit homepage, browse courses
   - Try to enroll in a course
   - Access lesson content

2. **As Instructor**:
   - Create a new course
   - Add lessons and quizzes
   - Check instructor dashboard

3. **As Admin**:
   - Access admin panel
   - Manage users and courses
   - View system analytics

## 🔧 Database Management

Your PostgreSQL database is running on:
- **Host**: localhost:5432 (in Docker)
- **Database**: techlanding_lms
- **User**: postgres
- **Password**: postgres123

### Useful Commands:
```bash
# Check database status
docker-compose ps

# Access database directly
docker exec -it techlanding_postgres psql -U postgres -d techlanding_lms

# View tables
\dt

# View users and roles
SELECT id, "clerkId", email, role FROM "User";
```

## 🎨 LMS Pages Overview

### Public Pages (No auth required)
- `/` - Homepage with featured courses
- `/about` - About page
- `/programs` - Programs overview
- `/lms/courses` - Course catalog (can browse without login)

### Protected Pages (Auth required)
- `/lms/my-courses` - Student's enrolled courses
- `/lms/course/[id]` - Course lesson viewer
- `/lms/quiz/[id]` - Quiz taking interface
- `/lms/badges` - Badges and achievements
- `/instructor/*` - Instructor dashboard and tools
- `/admin/*` - Admin panel and management

## 🚨 Troubleshooting

### Common Issues:

1. **"Access Denied" Errors**
   - Make sure your Clerk user has the correct role set
   - Run the role setting script again

2. **No Courses Showing**
   - Run the seed data script to create sample courses
   - Check that courses have status "PUBLISHED"

3. **Database Connection Issues**
   - Make sure PostgreSQL Docker container is running
   - Check environment variables are set correctly

4. **Middleware Errors**
   - Ensure `src/middleware.ts` exists (not in root)
   - Check Clerk keys are properly configured

### Need Help?
- Check browser console for errors
- Look at server logs for detailed error messages
- Verify database connections and permissions

---

## 📞 Support

If you encounter any issues, check:
1. Browser console for JavaScript errors
2. Server logs for backend errors
3. Database connectivity
4. Clerk authentication status

Happy learning! 🎓
