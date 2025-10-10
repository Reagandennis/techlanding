import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has instructor role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'INSTRUCTOR' && profile.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only instructors can create courses.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      shortDescription,
      description,
      level,
      language = 'en',
      tags = [],
      thumbnail,
      price = 0,
      discountPrice,
      currency = 'USD',
      modules = [],
      status = 'DRAFT',
      accessCode,
      prerequisites = []
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Generate a unique slug (simplified for Supabase transition)
    const timestamp = Date.now()
    const finalSlug = `${slug}-${timestamp}`

    // For now, return a mock response since we're transitioning from Prisma to Supabase
    // This would need to be implemented with proper Supabase course creation
    const course = {
      id: `course_${Date.now()}`,
      title,
      slug: finalSlug,
      status,
    };

    // Return the created course with basic info
    return NextResponse.json({
      id: course.id,
      title: course.title,
      slug: course.slug,
      status: course.status,
      message: status === 'PUBLISHED' 
        ? 'Course created and published successfully!' 
        : 'Course saved as draft successfully!'
    });

  } catch (error) {
    console.error('Error creating course:', error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A course with this title already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create course. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has instructor role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'INSTRUCTOR' && profile.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Return empty courses for now since we're transitioning to Supabase
    const formattedCourses: any[] = [];
    const totalCount = 0;

    return NextResponse.json({
      courses: formattedCourses,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}