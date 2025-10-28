'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, VideoIcon, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (result: UploadResult) => void;
  uploadType?: 'course-thumbnail' | 'lesson-video' | 'user-avatar' | 'general';
  entityId?: string;
  courseId?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

export default function FileUpload({
  onUpload,
  uploadType = 'general',
  entityId,
  courseId,
  accept,
  maxSize = 50 * 1024 * 1024, // 50MB
  multiple = false,
  disabled = false,
  className,
  children,
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const getDefaultAccept = () => {
    switch (uploadType) {
      case 'course-thumbnail':
      case 'user-avatar':
        return {
          'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
        };
      case 'lesson-video':
        return {
          'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi']
        };
      default:
        return {
          'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
          'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi'],
          'application/pdf': ['.pdf'],
          'text/*': ['.txt', '.md'],
        };
    }
  };

  const uploadFile = async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', uploadType);
    if (entityId) formData.append('entityId', entityId);
    if (courseId) formData.append('courseId', courseId);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    return result.data;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || acceptedFiles.length === 0) return;

    setIsUploading(true);
    const newUploadingFiles: UploadingFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
    }));

    setUploadingFiles(newUploadingFiles);

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        
        try {
          // Update progress to show upload starting
          setUploadingFiles(prev => 
            prev.map((uf, index) => 
              index === i ? { ...uf, progress: 10 } : uf
            )
          );

          const result = await uploadFile(file);

          // Update progress to complete
          setUploadingFiles(prev => 
            prev.map((uf, index) => 
              index === i ? { ...uf, progress: 100 } : uf
            )
          );

          // Call success callback
          onUpload(result);

        } catch (error) {
          // Update with error
          setUploadingFiles(prev => 
            prev.map((uf, index) => 
              index === i ? { 
                ...uf, 
                progress: 0, 
                error: error instanceof Error ? error.message : 'Upload failed' 
              } : uf
            )
          );
        }
      }
    } finally {
      setIsUploading(false);
      // Clear uploading files after a delay
      setTimeout(() => {
        setUploadingFiles([]);
      }, 3000);
    }
  }, [onUpload, uploadType, entityId, courseId, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || getDefaultAccept(),
    maxSize,
    multiple,
    disabled: disabled || isUploading,
  });

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-6 w-6" />;
    if (file.type.startsWith('video/')) return <VideoIcon className="h-6 w-6" />;
    return <FileIcon className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          isDragActive && 'border-blue-500 bg-blue-50',
          (disabled || isUploading) && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <input {...getInputProps()} />
        
        {children || (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive ? (
                'Drop the files here...'
              ) : (
                <>
                  Drag &apos;n&apos; drop files here, or{' '}
                  <span className="font-medium text-blue-600">click to select files</span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max size: {formatFileSize(maxSize)}
              {multiple && ', Multiple files allowed'}
            </p>
          </div>
        )}
      </div>

      {/* Uploading files list */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">
            {isUploading ? 'Uploading...' : 'Upload Complete'}
          </h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <div 
              key={index}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              {getFileIcon(uploadingFile.file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadingFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadingFile.file.size)}
                </p>
                
                {/* Progress bar */}
                {uploadingFile.progress > 0 && uploadingFile.progress < 100 && (
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadingFile.progress}%` }}
                    />
                  </div>
                )}
                
                {/* Success */}
                {uploadingFile.progress === 100 && !uploadingFile.error && (
                  <p className="text-xs text-green-600 mt-1">✓ Upload successful</p>
                )}
                
                {/* Error */}
                {uploadingFile.error && (
                  <p className="text-xs text-red-600 mt-1">✗ {uploadingFile.error}</p>
                )}
              </div>
              
              {/* Remove button */}
              <button
                onClick={() => removeUploadingFile(index)}
                className="p-1 text-gray-400 hover:text-gray-600"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}