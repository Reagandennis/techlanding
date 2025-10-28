# 🔄 Clerk-Prisma User Synchronization Setup

Your Clerk-Prisma synchronization system is now ready! Here's how to use it and manage user roles effectively.

## 🎯 What's Been Set Up

✅ **Webhook Handler**: `/src/app/api/webhooks/clerk/route.ts` - Automatically syncs new users from Clerk to Prisma  
✅ **User Sync Library**: `/src/lib/user-db-sync.ts` - Smart role assignment and user synchronization  
✅ **Admin API**: `/src/app/api/admin/users/route.ts` - Complete user role management API  
✅ **Admin Dashboard**: `/src/app/admin/users/page.tsx` - React component for managing user roles  
✅ **Sync Script**: `/src/scripts/sync-clerk-users.ts` - Bulk sync existing users  
✅ **Webhook Secret**: Configured with your actual webhook secret

## 🚀 Your Webhook Configuration

Your webhook is set up with:
- **Webhook URL**: `https://play.svix.com/in/e_4ckdKCyP2JdAe30HZYMJq82xIG8/`
- **Signing Secret**: `whsec_9UkwKrqMhLjL7KmVk4Pm5qgYsylNkvVW` (✅ Already configured)

## 🎭 User Role System

Your system has 4 roles with smart auto-assignment:

- **ADMIN**: Full system access
- **INSTRUCTOR**: Can create and manage courses
- **STUDENT**: Default for most users (learning access)
- **USER**: Basic access level

### Smart Role Assignment Logic

The system automatically assigns roles based on:
- **Email domains**: `.edu` emails → INSTRUCTOR
- **Email prefixes**: `admin@`, `instructor@`, `teacher@` → corresponding roles
- **Names**: Users with "instructor", "teacher", "professor" in their name
- **Default**: All others get STUDENT role

## 🔧 Quick Actions

### 1. Start Your Development Server

```bash
npm run dev
```

### 2. Sync Existing Users (Optional)

If you want to sync existing Clerk users to your database:

```bash
npm run sync:users
```

### 3. Access Admin Dashboard

Navigate to: `http://localhost:3000/admin/users` (or whatever port your app is running on)

### 4. Open Prisma Studio

For direct database management:

```bash
npm run prisma:studio
```

## 📊 Admin Dashboard Features

### User Management Interface (`/admin/users`)

- **Search & Filter**: Find users by name, email, or role
- **Role Statistics**: Visual overview of user distribution
- **Individual Updates**: Change roles with dropdown selection
- **Bulk Operations**: Update multiple users at once
- **Pagination**: Handle large user bases efficiently
- **Activity Tracking**: See enrollments and courses per user

## 🔄 How It Works

### Automatic Sync (via Webhooks)

1. **New User Signs Up** in Clerk → Webhook triggers → User created in Prisma with smart role
2. **User Updates Profile** → Webhook triggers → User info updated in Prisma (roles preserved)
3. **User Deleted** → Webhook triggers → User soft-deleted in Prisma

### Manual Role Changes

1. **Admin Dashboard**: Go to `/admin/users` and change roles with dropdowns
2. **Prisma Studio**: Run `npm run prisma:studio` for direct database access
3. **API**: Use the `/api/admin/users` endpoints programmatically

## 🛠 Testing the Setup

### Test Webhook (Recommended)

1. Create a new user in your Clerk application
2. Check your server logs to see webhook processing
3. Verify the user appears in Prisma Studio with the correct role

### Test Admin Dashboard

1. Make sure you have at least one ADMIN user in the database
2. Sign in with that admin account
3. Navigate to `/admin/users`
4. Try changing a user's role

### Test Bulk Sync

```bash
# This will show current state and sync any missing users
npm run sync:users
```

## 🔒 Security Features

- **Admin-only access** to role management
- **Self-protection**: Admins can't demote themselves
- **Bulk update protection**: Can't bulk-update admin users
- **Audit logging**: All role changes are logged
- **Input validation** with Zod schemas
- **CSRF protection** via middleware

## 🐛 Troubleshooting

### Common Issues

1. **"Admin access required" error**
   - Solution: Set your user role to ADMIN in Prisma Studio
   - Run: `npm run prisma:studio` → Find your user → Change role to ADMIN

2. **Webhook not working**
   - Check server is running and accessible
   - Verify webhook secret matches in `.env.local`
   - Check server logs for webhook errors

3. **Users not syncing**
   - Run manual sync: `npm run sync:users`
   - Check Clerk user list vs database users
   - Verify database connection

### Debug Commands

```bash
# Check database connection
npx prisma db push

# View current users
npx prisma studio

# Check server logs
npm run dev

# Manual sync with detailed output
npm run sync:users
```

## 💡 Next Steps

1. **Create an admin user** in Prisma Studio if you don't have one
2. **Test the webhook** by creating a new Clerk user
3. **Try the admin dashboard** at `/admin/users`
4. **Customize role assignment** logic if needed
5. **Set up your production webhook** endpoint when deploying

## 🎨 Customization

### Modify Role Assignment

Edit `/src/lib/user-db-sync.ts` → `determineUserRole()` function to change how roles are assigned.

### Add Custom Fields

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev`
3. Update sync functions

## 📋 Current Database State

You currently have 3 users:
- 2 ADMIN users
- 1 INSTRUCTOR user

## ✅ You're Ready!

Your Clerk-Prisma synchronization is complete! Here's what happens now:

1. **New users** signing up via Clerk will automatically be added to your Prisma database
2. **User roles** can be managed via the admin dashboard at `/admin/users`
3. **Existing users** can be synced using `npm run sync:users`
4. **All changes** are logged and audited for security

## 🆘 Need Help?

1. Check server logs when testing webhooks
2. Use Prisma Studio for direct database inspection
3. Run `npm run sync:users` for detailed sync reports
4. Test API endpoints with the admin dashboard

---

**🎉 Everything is set up and ready to go! Your Clerk authentication now seamlessly integrates with your Prisma database for complete user management.**