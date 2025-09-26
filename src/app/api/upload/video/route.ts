import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { protectApiRoute, getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const VideoUploadSchema = z.object({
  lessonId: z.string().cuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
})

// POST /api/upload/video - Upload video to Cloudinary
export async function POST(request: NextRequest) {
  const authCheck = await protectApiRoute(UserRole.INSTRUCTOR)
  
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const lessonId = formData.get('lessonId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    // Validate input
    const validatedData = VideoUploadSchema.parse({ lessonId, title, description })

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Verify lesson exists and user has permission
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            instructorId: true,
            title: true
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    if (lesson.course.instructorId !== user.id && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB' },
        { status: 413 }
      )
    }

    // Check file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only video files are allowed' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const originalName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
    const filename = `${originalName}-${timestamp}`

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          public_id: `lms/videos/${lesson.course.title}/${filename}`,
          folder: 'lms/videos',
          transformation: [
            // Create multiple quality versions
            { quality: 'auto:good' },
            { streaming_profile: 'hd' },
          ],
          // Generate thumbnail at 5 second mark
          eager: [
            { 
              width: 300, 
              height: 200, 
              crop: 'fill', 
              quality: 'auto:good',
              resource_type: 'image',
              start_offset: '5s'
            }
          ],
          // Enable streaming
          streaming_profile: 'hd',
          // Webhook for processing completion
          notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/cloudinary`,
          context: {
            lesson_id: lessonId,
            user_id: user.id,
            title: title,
          }
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(buffer)
    })

    const result = uploadResult as any

    // Save video file record to database
    const videoFile = await prisma.videoFile.create({
      data: {
        originalFilename: file.name,
        mimeType: file.type,
        fileSize: file.size,
        duration: result.duration || null,
        filePath: result.secure_url,
        thumbnailPath: result.eager?.[0]?.secure_url || null,
        processingStatus: 'PROCESSING',
        uploadedBy: user.id,
        lessonId: lessonId,
      }
    })

    // Update lesson with video URL
    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        videoUrl: result.secure_url,
        videoThumbnail: result.eager?.[0]?.secure_url || null,
        type: 'VIDEO',
      }
    })

    return NextResponse.json({
      success: true,
      videoFile,
      cloudinaryResult: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        duration: result.duration,
        format: result.format,
        bytes: result.bytes,
        thumbnail: result.eager?.[0]?.secure_url,
      }
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error uploading video:', error)
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    )
  }
}

// GET /api/upload/video - Get upload signature for client-side upload
export async function GET(request: NextRequest) {
  const authCheck = await protectApiRoute(UserRole.INSTRUCTOR)
  
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')
    
    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify lesson exists and user has permission
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            instructorId: true
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    if (lesson.course.instructorId !== user.id && user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Generate signed upload parameters
    const timestamp = Math.round((new Date).getTime() / 1000)
    const params = {
      timestamp,
      resource_type: 'video',
      folder: 'lms/videos',
      transformation: 'q_auto:good',
      context: `lesson_id=${lessonId}|user_id=${user.id}`,
      notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/cloudinary`,
    }

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!)

    return NextResponse.json({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      ...params
    })

  } catch (error) {
    console.error('Error generating upload signature:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    )
  }
}