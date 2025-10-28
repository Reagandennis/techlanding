-- Additional RLS Helper Functions and Advanced Policies

-- Function to check if user has permission to manage another user
CREATE OR REPLACE FUNCTION public.can_manage_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    requesting_user_role user_role;
    target_user_role user_role;
BEGIN
    -- Get the requesting user's role
    SELECT role INTO requesting_user_role
    FROM public.profiles
    WHERE id = auth.uid();
    
    -- Get the target user's role
    SELECT role INTO target_user_role
    FROM public.profiles
    WHERE id = target_user_id;
    
    -- Only ADMINs can manage other users
    -- ADMINs can manage anyone
    -- INSTRUCTORs cannot manage other INSTRUCTORs or ADMINs
    -- STUDENTs cannot manage anyone except themselves
    
    IF requesting_user_role = 'ADMIN' THEN
        RETURN TRUE;
    ELSIF requesting_user_role = 'INSTRUCTOR' AND target_user_role = 'STUDENT' THEN
        RETURN TRUE;
    ELSIF auth.uid() = target_user_id THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can enroll in a course
CREATE OR REPLACE FUNCTION public.can_enroll_in_course(course_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role user_role;
    course_published BOOLEAN;
    existing_enrollment_count INTEGER;
BEGIN
    -- Get user role
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = auth.uid();
    
    -- Check if course is published
    SELECT published INTO course_published
    FROM public.courses
    WHERE id = course_id;
    
    -- Check if user is already enrolled
    SELECT COUNT(*) INTO existing_enrollment_count
    FROM public.enrollments
    WHERE user_id = auth.uid() AND course_id = can_enroll_in_course.course_id;
    
    -- Allow enrollment if:
    -- 1. User is a STUDENT
    -- 2. Course is published
    -- 3. User is not already enrolled
    RETURN user_role = 'STUDENT' 
           AND course_published = TRUE 
           AND existing_enrollment_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access course content
CREATE OR REPLACE FUNCTION public.can_access_course_content(course_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role user_role;
    course_published BOOLEAN;
    course_instructor_id UUID;
    is_enrolled BOOLEAN;
BEGIN
    -- Get user role
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = auth.uid();
    
    -- Get course details
    SELECT published, instructor_id INTO course_published, course_instructor_id
    FROM public.courses
    WHERE id = course_id;
    
    -- Check if user is enrolled
    SELECT EXISTS(
        SELECT 1 FROM public.enrollments
        WHERE user_id = auth.uid() AND course_id = can_access_course_content.course_id
    ) INTO is_enrolled;
    
    -- Allow access if:
    -- 1. User is ADMIN
    -- 2. User is the course instructor
    -- 3. User is enrolled in the course and course is published
    RETURN user_role = 'ADMIN'
           OR course_instructor_id = auth.uid()
           OR (is_enrolled AND course_published);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Advanced policy for course enrollment
CREATE POLICY "Users can enroll in eligible courses" ON public.enrollments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        public.can_enroll_in_course(course_id)
    );

-- Advanced policy for lesson access
CREATE POLICY "Advanced lesson access control" ON public.lessons
    FOR SELECT USING (
        public.can_access_course_content(course_id)
    );

-- Policy for instructors to view student progress in their courses
CREATE POLICY "Instructors can view student progress in their courses" ON public.progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id 
            AND (
                c.instructor_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role = 'ADMIN'
                )
            )
        )
    );

-- Advanced enrollment policy for instructors and admins
CREATE POLICY "Instructors and admins can view all enrollments in their courses" ON public.enrollments
    FOR SELECT USING (
        auth.uid() = user_id OR -- Users can see their own enrollments
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id 
            AND (
                c.instructor_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role = 'ADMIN'
                )
            )
        )
    );

-- Function to automatically update course enrollment progress
CREATE OR REPLACE FUNCTION public.update_enrollment_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    new_progress DECIMAL(5,2);
BEGIN
    -- Calculate total lessons in the course
    SELECT COUNT(*) INTO total_lessons
    FROM public.lessons
    WHERE course_id = NEW.course_id AND is_published = TRUE;
    
    -- Calculate completed lessons for this user
    SELECT COUNT(*) INTO completed_lessons
    FROM public.progress
    WHERE user_id = NEW.user_id 
    AND course_id = NEW.course_id 
    AND is_completed = TRUE;
    
    -- Calculate progress percentage
    IF total_lessons > 0 THEN
        new_progress := (completed_lessons::DECIMAL / total_lessons::DECIMAL) * 100;
    ELSE
        new_progress := 0;
    END IF;
    
    -- Update enrollment progress
    UPDATE public.enrollments
    SET progress = new_progress,
        completed_at = CASE 
            WHEN new_progress = 100 AND completed_at IS NULL THEN NOW()
            WHEN new_progress < 100 THEN NULL
            ELSE completed_at
        END
    WHERE user_id = NEW.user_id AND course_id = NEW.course_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update enrollment progress when lesson progress changes
CREATE TRIGGER on_progress_updated
    AFTER INSERT OR UPDATE ON public.progress
    FOR EACH ROW
    WHEN (NEW.is_completed = TRUE)
    EXECUTE FUNCTION public.update_enrollment_progress();

-- Function to handle role changes and validate permissions
CREATE OR REPLACE FUNCTION public.validate_role_change()
RETURNS TRIGGER AS $$
DECLARE
    requesting_user_role user_role;
BEGIN
    -- Get the requesting user's role
    SELECT role INTO requesting_user_role
    FROM public.profiles
    WHERE id = auth.uid();
    
    -- Only ADMINs can change roles
    IF requesting_user_role != 'ADMIN' AND OLD.role != NEW.role THEN
        RAISE EXCEPTION 'Only administrators can change user roles';
    END IF;
    
    -- Prevent users from promoting themselves to ADMIN
    IF auth.uid() = NEW.id AND OLD.role != 'ADMIN' AND NEW.role = 'ADMIN' THEN
        RAISE EXCEPTION 'Users cannot promote themselves to administrator';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to validate role changes
CREATE TRIGGER validate_role_change_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_role_change();

-- Function to create audit log for sensitive operations
CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Function to log sensitive changes
CREATE OR REPLACE FUNCTION public.log_sensitive_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log role changes
    IF TG_TABLE_NAME = 'profiles' AND OLD.role != NEW.role THEN
        INSERT INTO public.audit_logs (
            user_id, action, table_name, record_id, 
            old_values, new_values
        ) VALUES (
            auth.uid(), 'role_change', TG_TABLE_NAME, NEW.id,
            jsonb_build_object('role', OLD.role),
            jsonb_build_object('role', NEW.role)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for logging role changes
CREATE TRIGGER log_profile_changes
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_sensitive_changes();