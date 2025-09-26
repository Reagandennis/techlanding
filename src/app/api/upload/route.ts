import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  uploadToCloudinary, 
  uploadCourseThumbnail, 
  uploadLessonVideo, 
  uploadUserAvatar,
  generateSignedUploadUrl 
} from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('type') as string;
    const entityId = formData.get('entityId') as string;
    const courseId = formData.get('courseId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let result;

    switch (uploadType) {
      case 'course-thumbnail':
        if (!entityId) {
          return NextResponse.json(
            { error: 'Course ID required for thumbnail upload' },
            { status: 400 }
          );
        }
        result = await uploadCourseThumbnail(buffer, entityId);
        break;

      case 'lesson-video':
        if (!entityId || !courseId) {
          return NextResponse.json(
            { error: 'Lesson ID and Course ID required for video upload' },
            { status: 400 }
          );
        }
        result = await uploadLessonVideo(buffer, entityId, courseId);
        break;

      case 'user-avatar':
        result = await uploadUserAvatar(buffer, userId);
        break;

      case 'general':
      default:
        result = await uploadToCloudinary(buffer, {
          folder: 'techlanding/general',
          resource_type: 'auto',
          tags: ['general', userId],
        });
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        duration: result.duration,
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}

// Generate signed upload URL for client-side uploads
export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const uploadType = searchParams.get('type') || 'general';
    const maxBytes = parseInt(searchParams.get('maxBytes') || '50000000'); // 50MB default

    let folder: string;
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
    let tags: string[] = [userId];

    switch (uploadType) {
      case 'course-thumbnail':
        folder = 'techlanding/courses/thumbnails';
        resourceType = 'image';
        tags.push('course', 'thumbnail');
        break;
      case 'lesson-video':
        folder = 'techlanding/courses/videos';
        resourceType = 'video';
        tags.push('lesson', 'video');
        break;
      case 'user-avatar':
        folder = 'techlanding/users/avatars';
        resourceType = 'image';
        tags.push('avatar');
        break;
      default:
        folder = 'techlanding/general';
        resourceType = 'auto';
        tags.push('general');
        break;
    }

    const signedData = generateSignedUploadUrl({
      folder,
      resourceType,
      tags,
      maxBytes,
    });

    return NextResponse.json({
      success: true,
      data: signedData,
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`
    });

  } catch (error) {
    console.error('Signed upload URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL', details: error.message },
      { status: 500 }
    );
  }
}