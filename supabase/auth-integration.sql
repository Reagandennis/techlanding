-- Supabase Auth Integration for existing Prisma tables
-- Run this in Supabase SQL Editor after running the Prisma migration

-- Enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
        'STUDENT'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Enable RLS on other key tables
ALTER TABLE public."Course" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Enrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Progress" ENABLE ROW LEVEL SECURITY;

-- Course policies
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON public."Course";
CREATE POLICY "Published courses are viewable by everyone" ON public."Course"
    FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Instructors can manage their own courses" ON public."Course";
CREATE POLICY "Instructors can manage their own courses" ON public."Course"
    FOR ALL USING (
        "instructorId" = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Enrollment policies
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public."Enrollment";
CREATE POLICY "Users can view their own enrollments" ON public."Enrollment"
    FOR SELECT USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Users can create their own enrollments" ON public."Enrollment";
CREATE POLICY "Users can create their own enrollments" ON public."Enrollment"
    FOR INSERT WITH CHECK (auth.uid() = "userId");

-- Progress policies
DROP POLICY IF EXISTS "Users can view their own progress" ON public."Progress";
CREATE POLICY "Users can view their own progress" ON public."Progress"
    FOR SELECT USING (auth.uid() = "userId");

DROP POLICY IF EXISTS "Users can update their own progress" ON public."Progress";
CREATE POLICY "Users can update their own progress" ON public."Progress"
    FOR ALL USING (auth.uid() = "userId");

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);