-- =====================================================
-- SUPABASE ROLE-BASED ACCESS CONTROL SETUP
-- Run this script in Supabase SQL Editor
-- =====================================================

-- First, ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- =====================================================
-- 1. PROFILE ACCESS POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Admins can update any profile including roles
CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Admins can insert new profiles
CREATE POLICY "Admins can insert profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- =====================================================
-- 2. COURSE ACCESS POLICIES
-- =====================================================

-- Enable RLS on Course table
ALTER TABLE public."Course" ENABLE ROW LEVEL SECURITY;

-- Everyone can view published courses
CREATE POLICY "Anyone can view published courses" 
ON public."Course" FOR SELECT 
USING (published = true);

-- Instructors can view their own courses
CREATE POLICY "Instructors can view their own courses" 
ON public."Course" FOR SELECT 
USING (
  "instructorId" = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('ADMIN', 'INSTRUCTOR')
  )
);

-- Only instructors and admins can create courses
CREATE POLICY "Instructors and admins can create courses" 
ON public."Course" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('INSTRUCTOR', 'ADMIN')
  )
);

-- Instructors can update their own courses, admins can update any
CREATE POLICY "Course owners and admins can update courses" 
ON public."Course" FOR UPDATE 
USING (
  "instructorId" = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- =====================================================
-- 3. ENROLLMENT ACCESS POLICIES
-- =====================================================

-- Enable RLS on Enrollment table
ALTER TABLE public."Enrollment" ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments" 
ON public."Enrollment" FOR SELECT 
USING (auth.uid() = "userId");

-- Instructors can view enrollments for their courses
CREATE POLICY "Instructors can view course enrollments" 
ON public."Enrollment" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public."Course" c 
    WHERE c.id = "courseId" AND c."instructorId" = auth.uid()
  )
);

-- Admins can view all enrollments
CREATE POLICY "Admins can view all enrollments" 
ON public."Enrollment" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Users can create their own enrollments
CREATE POLICY "Users can create their own enrollments" 
ON public."Enrollment" FOR INSERT 
WITH CHECK (auth.uid() = "userId");

-- =====================================================
-- 4. PROGRESS ACCESS POLICIES
-- =====================================================

-- Enable RLS on Progress table
ALTER TABLE public."Progress" ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own progress
CREATE POLICY "Users can manage their own progress" 
ON public."Progress" FOR ALL 
USING (auth.uid() = "userId")
WITH CHECK (auth.uid() = "userId");

-- Instructors can view progress for their course students
CREATE POLICY "Instructors can view student progress" 
ON public."Progress" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public."Enrollment" e
    JOIN public."Course" c ON e."courseId" = c.id
    WHERE e."userId" = public."Progress"."userId" 
    AND c."instructorId" = auth.uid()
  )
);

-- Admins can view all progress
CREATE POLICY "Admins can view all progress" 
ON public."Progress" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- =====================================================
-- 5. CREATE UTILITY FUNCTIONS
-- =====================================================

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.user_has_role(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'STUDENT');
END;
$$;

-- Function to check if user can access admin features
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.user_has_role('ADMIN');
END;
$$;

-- Function to check if user can access instructor features
CREATE OR REPLACE FUNCTION public.is_instructor_or_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.user_has_role('INSTRUCTOR') OR public.user_has_role('ADMIN');
END;
$$;

-- =====================================================
-- 6. CREATE TEST ACCOUNTS (Run after user signup)
-- =====================================================

-- This function will be used to create test accounts
-- Note: You'll need to sign up these users first via Supabase Auth UI
-- Then run the account setup separately

CREATE OR REPLACE FUNCTION public.setup_test_accounts()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function should be called after manually creating the auth users
  -- It will update their profiles with appropriate roles
  
  RETURN 'Test account setup function created. Use setup_user_role() to assign roles after signup.';
END;
$$;

-- Function to setup user role (can be called from API)
CREATE OR REPLACE FUNCTION public.setup_user_role(user_email text, user_role text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Find user by email from auth.users
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Insert or update profile
  INSERT INTO public.profiles (id, email, role, name)
  VALUES (user_id, user_email, user_role, split_part(user_email, '@', 1))
  ON CONFLICT (id) 
  DO UPDATE SET role = user_role, email = user_email;
  
  RETURN 'Successfully set role ' || user_role || ' for user: ' || user_email;
END;
$$;

-- =====================================================
-- 7. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant permissions for the utility functions
GRANT EXECUTE ON FUNCTION public.user_has_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_instructor_or_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.setup_user_role(text, text) TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

SELECT 'Supabase role-based access control setup complete!' as message;