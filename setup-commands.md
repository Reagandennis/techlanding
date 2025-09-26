# Quick Role Setup Commands

Since the authentication is causing issues, here are direct commands to set up your accounts:

## Method 1: Using curl (Direct API Call)

### Set Admin Role
```bash
curl -X POST http://localhost:3000/api/dev/setup-role \
  -H "Content-Type: application/json" \
  -d '{
    "targetClerkId": "YOUR_CLERK_USER_ID",
    "role": "ADMIN",
    "name": "Admin User",
    "email": "admin@example.com"
  }'
```

### Set Instructor Role
```bash
curl -X POST http://localhost:3000/api/dev/setup-role \
  -H "Content-Type: application/json" \
  -d '{
    "targetClerkId": "YOUR_CLERK_USER_ID",
    "role": "INSTRUCTOR", 
    "name": "Instructor Name",
    "email": "instructor@example.com"
  }'
```

### Check Current Users
```bash
curl http://localhost:3000/api/dev/setup-role
```

## Method 2: Using PowerShell (Windows)

### Set Admin Role
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/dev/setup-role" -Method POST -ContentType "application/json" -Body '{"targetClerkId":"YOUR_CLERK_USER_ID","role":"ADMIN","name":"Admin User","email":"admin@example.com"}'
```

### Set Instructor Role  
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/dev/setup-role" -Method POST -ContentType "application/json" -Body '{"targetClerkId":"YOUR_CLERK_USER_ID","role":"INSTRUCTOR","name":"Instructor Name","email":"instructor@example.com"}'
```

## How to Get Your Clerk User ID

### Option 1: From Browser Console
1. Sign into your app
2. Open browser dev tools (F12)
3. Go to Console tab
4. Type: `window.__clerk?.user?.id`
5. Copy the returned ID (starts with "user_")

### Option 2: From Network Tab
1. Sign into your app
2. Open dev tools → Network tab
3. Reload the page
4. Look for requests to clerk API
5. Check the request headers for user ID

### Option 3: Hardcode for Testing
If you just want to test, you can use any valid Clerk ID format:
- `user_2ABC123XYZ` (replace with your actual ID)

## Example Complete Setup

Replace `user_YOUR_ACTUAL_ID` with your real Clerk user ID:

```bash
# Make yourself admin
curl -X POST http://localhost:3000/api/dev/setup-role \
  -H "Content-Type: application/json" \
  -d '{
    "targetClerkId": "user_YOUR_ACTUAL_ID",
    "role": "ADMIN",
    "name": "Your Name",
    "email": "your@email.com"
  }'
```

## After Setup

Visit these URLs to test your new roles:
- **Admin**: http://localhost:3000/admin/analytics  
- **Instructor**: http://localhost:3000/lms/instructor
- **Instructor Analytics**: http://localhost:3000/instructor/analytics

## Security Note

⚠️ **IMPORTANT**: The `/api/dev/setup-role` endpoint bypasses all authentication. 
**DELETE this file** before deploying to production:
- Delete: `src/app/api/dev/setup-role/route.ts`
- Delete: `src/app/dev/set-roles/page.tsx` 
- Delete: `setup-commands.md`