-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');
CREATE TYPE course_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'PRIVATE');
CREATE TYPE course_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS');
CREATE TYPE enrollment_status AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- Create profiles table linked to auth.users
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role user_role DEFAULT 'STUDENT' NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    bio TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    
    -- Social links
    linkedin_url TEXT,
    twitter_url TEXT,
    github_url TEXT,
    website_url TEXT,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    
    -- Gamification
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create courses table
CREATE TABLE public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    thumbnail TEXT,
    trailer_video TEXT,
    
    -- Pricing
    price DECIMAL(10,2) DEFAULT 0 NOT NULL,
    discount_price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD' NOT NULL,
    
    -- Course Status
    status course_status DEFAULT 'DRAFT' NOT NULL,
    published BOOLEAN DEFAULT false NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Course Details
    level course_level DEFAULT 'BEGINNER' NOT NULL,
    duration INTEGER, -- in minutes
    language TEXT DEFAULT 'en' NOT NULL,
    
    -- SEO & Marketing
    meta_title TEXT,
    meta_description TEXT,
    tags TEXT[],
    
    -- Access Control
    access_code TEXT UNIQUE,
    
    -- Instructor
    instructor_id UUID REFERENCES public.profiles(id) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create modules table
CREATE TABLE public.modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    prerequisites TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create lessons table
CREATE TABLE public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    
    -- Media URLs
    video_url TEXT,
    audio_url TEXT,
    document_url TEXT,
    video_thumbnail TEXT,
    video_transcript TEXT,
    
    -- Lesson properties
    duration INTEGER, -- in seconds
    "order" INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT false NOT NULL,
    is_free BOOLEAN DEFAULT false NOT NULL,
    
    -- Relations
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create enrollments table
CREATE TABLE public.enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    status enrollment_status DEFAULT 'ACTIVE' NOT NULL,
    progress DECIMAL(5,2) DEFAULT 0 NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    payment_status payment_status DEFAULT 'PENDING' NOT NULL,
    payment_amount DECIMAL(10,2),
    paid_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, course_id)
);

-- Create progress tracking table
CREATE TABLE public.progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    is_completed BOOLEAN DEFAULT false NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER, -- in seconds
    
    UNIQUE(user_id, lesson_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX profiles_role_idx ON public.profiles(role);
CREATE INDEX courses_instructor_idx ON public.courses(instructor_id);
CREATE INDEX courses_published_idx ON public.courses(published);
CREATE INDEX courses_slug_idx ON public.courses(slug);
CREATE INDEX enrollments_user_idx ON public.enrollments(user_id);
CREATE INDEX enrollments_course_idx ON public.enrollments(course_id);
CREATE INDEX progress_user_idx ON public.progress(user_id);
CREATE INDEX progress_lesson_idx ON public.progress(lesson_id);

-- Create function to automatically create profile on user signup
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
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER modules_updated_at
    BEFORE UPDATE ON public.modules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can update any profile" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Courses policies
CREATE POLICY "Published courses are viewable by everyone" ON public.courses
    FOR SELECT USING (published = true);

CREATE POLICY "Instructors can view their own courses" ON public.courses
    FOR SELECT USING (
        auth.uid() = instructor_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('ADMIN', 'INSTRUCTOR')
        )
    );

CREATE POLICY "Instructors can create courses" ON public.courses
    FOR INSERT WITH CHECK (
        auth.uid() = instructor_id AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('INSTRUCTOR', 'ADMIN')
        )
    );

CREATE POLICY "Instructors can update their own courses" ON public.courses
    FOR UPDATE USING (
        auth.uid() = instructor_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can delete courses" ON public.courses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Modules policies
CREATE POLICY "Modules are viewable if course is accessible" ON public.modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id AND (
                c.published = true OR
                c.instructor_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role = 'ADMIN'
                )
            )
        )
    );

CREATE POLICY "Instructors can manage modules for their courses" ON public.modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id AND (
                c.instructor_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role = 'ADMIN'
                )
            )
        )
    );

-- Lessons policies
CREATE POLICY "Lessons are viewable if course is accessible" ON public.lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id AND (
                c.published = true OR
                c.instructor_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role = 'ADMIN'
                )
            )
        )
    );

CREATE POLICY "Instructors can manage lessons for their courses" ON public.lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id AND (
                c.instructor_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role = 'ADMIN'
                )
            )
        )
    );

-- Enrollments policies
CREATE POLICY "Users can view their own enrollments" ON public.enrollments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments" ON public.enrollments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Instructors can view enrollments for their courses" ON public.enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Progress policies
CREATE POLICY "Users can view their own progress" ON public.progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Instructors can view progress for their courses" ON public.progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );