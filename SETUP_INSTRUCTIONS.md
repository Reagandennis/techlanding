# 🚀 Complete Supabase Setup Instructions

Your Supabase API keys are now correctly configured! Follow these steps to complete the setup:

## ✅ Status Check
- ✅ Supabase API keys configured correctly
- ❌ Database tables not created yet
- ❌ Authentication not working yet

## 📋 Step 1: Run Database Migration

1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/wqacmemtnwezwbguimtn
2. **Go to SQL Editor** (left sidebar)
3. **Copy the content** from `supabase/quick-setup.sql` 
4. **Paste it into the SQL Editor**
5. **Click "Run"** to create the tables

## 📋 Step 2: Verify Setup

After running the SQL, test your setup:

```bash
node test-supabase.js
```

You should see:
- ✅ Supabase connection successful!
- ✅ Profiles table exists

## 📋 Step 3: Test Authentication

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to**: http://localhost:3002/auth/sign-up

3. **Create a test account** with:
   - Email: test@example.com
   - Password: testpassword123
   - Name: Test User
   - Role: Student

4. **Check if it works**:
   - User should be created successfully
   - Profile should be automatically created with STUDENT role
   - You should be redirected to the student dashboard

## 🔧 Troubleshooting

### If signup still shows "Invalid API key":
1. Restart your development server (`npm run dev`)
2. Clear browser cache
3. Check that the `.env.local` file has the correct keys

### If you get database errors:
1. Make sure you ran the SQL migration in Supabase Dashboard
2. Check that the `profiles` table exists in your Supabase project

### If redirects don't work:
1. Check that your middleware is working
2. Look for any console errors in the browser

## 🎯 What Should Work After Setup:

1. **Sign Up**: New users get STUDENT role automatically
2. **Sign In**: Existing users can log in
3. **Navigation**: Shows correct LMS access based on user role
4. **Role-based Routing**: Users get redirected to appropriate dashboards
5. **Debug Panel**: Shows auth state in development mode

## 🔐 Security Features Active:

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only see their own data
- ✅ Automatic profile creation on signup
- ✅ JWT-based authentication
- ✅ Role-based authorization

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check the network tab for failed requests
3. Verify the SQL migration ran successfully
4. Run the test script: `node test-supabase.js`

Once you complete Step 1 (running the SQL migration), your Supabase authentication system will be fully functional!