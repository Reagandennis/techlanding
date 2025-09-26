import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  asset_id: string;
  version: number;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  [key: string]: any;
}

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: any[];
  quality?: string | number;
  format?: string;
  tags?: string[];
}

/**
 * Upload file to Cloudinary
 */
export async function uploadToCloudinary(
  file: string | Buffer,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: options.resource_type || 'auto',
      folder: options.folder || 'techlanding',
      public_id: options.public_id,
      transformation: options.transformation,
      quality: options.quality || 'auto',
      format: options.format,
      tags: options.tags,
      // Video-specific settings
      ...(options.resource_type === 'video' && {
        eager: [
          { quality: 'auto', format: 'mp4' },
          { quality: 'auto:low', format: 'mp4' },
          { quality: 'auto:good', format: 'webm' },
        ],
        eager_async: true,
        eager_notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/cloudinary`,
      }),
    });

    return result as CloudinaryUploadResult;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}

/**
 * Upload course thumbnail
 */
export async function uploadCourseThumbnail(
  file: string | Buffer,
  courseId: string
): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(file, {
    folder: 'techlanding/courses/thumbnails',
    public_id: `course-${courseId}-thumbnail`,
    resource_type: 'image',
    transformation: [
      { width: 1280, height: 720, crop: 'fill', quality: 'auto' },
      { fetch_format: 'auto' },
    ],
    tags: ['course', 'thumbnail', courseId],
  });
}

/**
 * Upload lesson video
 */
export async function uploadLessonVideo(
  file: string | Buffer,
  lessonId: string,
  courseId: string
): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(file, {
    folder: 'techlanding/courses/videos',
    public_id: `lesson-${lessonId}-video`,
    resource_type: 'video',
    quality: 'auto',
    tags: ['lesson', 'video', courseId, lessonId],
  });
}

/**
 * Upload user avatar
 */
export async function uploadUserAvatar(
  file: string | Buffer,
  userId: string
): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(file, {
    folder: 'techlanding/users/avatars',
    public_id: `user-${userId}-avatar`,
    resource_type: 'image',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
      { fetch_format: 'auto' },
    ],
    tags: ['user', 'avatar', userId],
  });
}

/**
 * Upload certificate template
 */
export async function uploadCertificateTemplate(
  file: string | Buffer,
  templateId: string
): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(file, {
    folder: 'techlanding/certificates/templates',
    public_id: `certificate-template-${templateId}`,
    resource_type: 'image',
    quality: 'auto',
    format: 'png',
    tags: ['certificate', 'template', templateId],
  });
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
}

/**
 * Generate video thumbnail from Cloudinary video
 */
export function generateVideoThumbnail(
  videoPublicId: string,
  options: {
    width?: number;
    height?: number;
    time?: number;
  } = {}
): string {
  const { width = 640, height = 360, time = 5 } = options;
  
  return cloudinary.url(videoPublicId, {
    resource_type: 'video',
    start_offset: `${time}s`,
    end_offset: `${time + 1}s`,
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    format: 'jpg',
  });
}

/**
 * Generate optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
    crop?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    quality: options.quality || 'auto',
    fetch_format: options.format || 'auto',
    width: options.width,
    height: options.height,
    crop: options.crop || 'scale',
    secure: true,
  });
}

/**
 * Generate video streaming URL with adaptive bitrate
 */
export function getVideoStreamingUrl(
  videoPublicId: string,
  options: {
    quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best';
    format?: 'mp4' | 'webm' | 'auto';
  } = {}
): string {
  return cloudinary.url(videoPublicId, {
    resource_type: 'video',
    quality: options.quality || 'auto',
    format: options.format || 'auto',
    streaming_profile: 'hd',
    secure: true,
  });
}

/**
 * Get video duration and metadata
 */
export async function getVideoMetadata(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'video',
    });
    
    return {
      duration: result.duration,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      url: result.secure_url,
      created_at: result.created_at,
    };
  } catch (error) {
    console.error('Error getting video metadata:', error);
    throw new Error('Failed to get video metadata');
  }
}

/**
 * Generate signed upload URL for client-side uploads
 */
export function generateSignedUploadUrl(options: {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  tags?: string[];
  maxBytes?: number;
}) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp,
    folder: options.folder || 'techlanding',
    resource_type: options.resourceType || 'auto',
    tags: options.tags?.join(','),
    max_bytes: options.maxBytes,
  };

  // Remove undefined values
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined)
  );

  const signature = cloudinary.utils.api_sign_request(
    filteredParams,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    ...filteredParams,
  };
}

export { cloudinary };
export default cloudinary;