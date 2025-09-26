'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  X, 
  Download, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calendar,
  BookOpen,
  Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CldUploadWidget } from 'next-cloudinary';

// Types
interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: string | null;
  maxPoints: number;
  submissionType: 'TEXT' | 'FILE' | 'BOTH';
  allowedFileTypes: string[];
  maxFileSize: number;
  maxFiles: number;
  isGraded: boolean;
  courseId?: string;
  lessonId?: string;
  course?: {
    id: string;
    title: string;
  };
  lesson?: {
    id: string;
    title: string;
  };
}

interface Submission {
  id: string;
  textContent: string | null;
  files: Array<{
    id: string;
    filename: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }>;
  submittedAt: string;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
  grade: number | null;
  feedback: string | null;
  gradedAt: string | null;
  gradedBy?: {
    name: string;
    email: string;
  };
}

interface AssignmentPlayerProps {
  assignmentId: string;
  courseId?: string;
  lessonId?: string;
  onSubmit?: (submissionId: string) => void;
  onProgress?: (progress: { submitted: boolean; grade?: number }) => void;
}

export const AssignmentPlayer: React.FC<AssignmentPlayerProps> = ({
  assignmentId,
  courseId,
  lessonId,
  onSubmit,
  onProgress
}) => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [textContent, setTextContent] = useState('');
  const [files, setFiles] = useState<Array<{
    id: string;
    filename: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }>>([]);

  // Load assignment and existing submission
  const loadAssignment = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/lms/assignment/${assignmentId}`);
      if (!response.ok) {
        throw new Error('Failed to load assignment');
      }
      
      const data = await response.json();
      setAssignment(data.assignment);
      setSubmission(data.submission || null);
      
      // Pre-fill form if submission exists
      if (data.submission) {
        setTextContent(data.submission.textContent || '');
        setFiles(data.submission.files || []);
        
        // Report progress
        onProgress?.({
          submitted: true,
          grade: data.submission.grade
        });
      }
      
    } catch (error) {
      console.error('Error loading assignment:', error);
      toast.error('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  }, [assignmentId, onProgress]);

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  // File upload success handler
  const handleFileUpload = useCallback((result: any) => {
    const newFile = {
      id: result.public_id,
      filename: result.original_filename || result.public_id,
      fileUrl: result.secure_url,
      fileSize: result.bytes,
      fileType: result.resource_type
    };

    if (files.length >= (assignment?.maxFiles || 5)) {
      toast.error(`Maximum ${assignment?.maxFiles || 5} files allowed`);
      return;
    }

    setFiles(prev => [...prev, newFile]);
    toast.success('File uploaded successfully');
  }, [files.length, assignment?.maxFiles]);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Submit assignment
  const handleSubmit = async () => {
    if (!assignment) return;

    // Validation
    if (assignment.submissionType === 'TEXT' && !textContent.trim()) {
      toast.error('Text content is required');
      return;
    }

    if (assignment.submissionType === 'FILE' && files.length === 0) {
      toast.error('At least one file is required');
      return;
    }

    if (assignment.submissionType === 'BOTH' && !textContent.trim() && files.length === 0) {
      toast.error('Either text content or file is required');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/lms/assignment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId,
          courseId,
          lessonId,
          textContent: textContent.trim() || null,
          files: files
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Submission failed');
      }

      const data = await response.json();
      
      // Update submission state
      setSubmission(data.submission);
      
      // Report success
      toast.success('Assignment submitted successfully!');
      onSubmit?.(data.submission.id);
      onProgress?.({
        submitted: true,
        grade: data.submission.grade
      });

    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  // Update submission (if allowed)
  const handleUpdate = async () => {
    if (!assignment || !submission) return;

    try {
      setSubmitting(true);

      const response = await fetch(`/api/lms/assignment/submit/${submission.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textContent: textContent.trim() || null,
          files: files
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Update failed');
      }

      const data = await response.json();
      setSubmission(data.submission);
      
      toast.success('Submission updated successfully!');

    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update submission');
    } finally {
      setSubmitting(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if assignment is overdue
  const isOverdue = assignment?.dueDate ? new Date() > new Date(assignment.dueDate) : false;
  const canSubmit = !submission || (submission.status !== 'GRADED' && !isOverdue);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading assignment...</span>
      </div>
    );
  }

  if (!assignment) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Assignment Not Found</h3>
          <p className="text-gray-600">The requested assignment could not be found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assignment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {assignment.title}
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {assignment.course && (
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {assignment.course.title}
                  </div>
                )}
                {assignment.lesson && (
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {assignment.lesson.title}
                  </div>
                )}
                {assignment.dueDate && (
                  <div className={`flex items-center ${isOverdue ? 'text-red-600' : ''}`}>
                    <Calendar className="h-4 w-4 mr-1" />
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isOverdue ? 'destructive' : 'secondary'}>
                {assignment.maxPoints} points
              </Badge>
              {submission && (
                <Badge variant={submission.status === 'GRADED' ? 'default' : 'secondary'}>
                  {submission.status}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-4">
            <p className="text-gray-700">{assignment.description}</p>
          </div>
          {assignment.instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
              <div className="text-sm text-blue-800 whitespace-pre-wrap">
                {assignment.instructions}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Status */}
      {submission && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Submission Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Submitted</Label>
                <p className="text-sm text-gray-900">
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <Badge variant={submission.status === 'GRADED' ? 'default' : 'secondary'}>
                  {submission.status}
                </Badge>
              </div>
              {submission.grade !== null && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Grade</Label>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-green-600">
                      {submission.grade}
                    </span>
                    <span className="text-sm text-gray-600 ml-1">
                      / {assignment.maxPoints}
                    </span>
                    <Progress 
                      value={(submission.grade / assignment.maxPoints) * 100} 
                      className="w-20 ml-2" 
                    />
                  </div>
                </div>
              )}
            </div>
            
            {submission.feedback && (
              <div className="mt-4 bg-gray-50 border rounded-lg p-4">
                <Label className="text-sm font-medium text-gray-600 mb-2 block">
                  Instructor Feedback
                </Label>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {submission.feedback}
                </p>
                {submission.gradedBy && (
                  <p className="text-xs text-gray-500 mt-2">
                    Graded by {submission.gradedBy.name} on{' '}
                    {submission.gradedAt ? new Date(submission.gradedAt).toLocaleString() : 'N/A'}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submission Form */}
      {canSubmit && (
        <Card>
          <CardHeader>
            <CardTitle>
              {submission ? 'Update Submission' : 'Submit Assignment'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Text Content */}
            {(assignment.submissionType === 'TEXT' || assignment.submissionType === 'BOTH') && (
              <div>
                <Label htmlFor="textContent">
                  Text Submission {assignment.submissionType === 'TEXT' && '*'}
                </Label>
                <Textarea
                  id="textContent"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Enter your submission text here..."
                  rows={8}
                  className="mt-1"
                />
              </div>
            )}

            {/* File Upload */}
            {(assignment.submissionType === 'FILE' || assignment.submissionType === 'BOTH') && (
              <div>
                <Label>
                  File Upload {assignment.submissionType === 'FILE' && '*'}
                </Label>
                <div className="mt-2 space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-gray-50 border rounded-lg p-3">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.fileSize)} • {file.fileType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.fileUrl, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {files.length < (assignment.maxFiles || 5) && (
                    <CldUploadWidget
                      uploadPreset="ml_default"
                      onSuccess={handleFileUpload}
                      options={{
                        maxFiles: 1,
                        maxFileSize: assignment.maxFileSize || 10000000, // 10MB default
                        allowedFormats: assignment.allowedFileTypes.length > 0 
                          ? assignment.allowedFileTypes 
                          : undefined
                      }}
                    >
                      {({ open }) => (
                        <Button
                          variant="outline"
                          onClick={() => open()}
                          className="w-full border-dashed"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </Button>
                      )}
                    </CldUploadWidget>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Max {assignment.maxFiles} files, {formatFileSize(assignment.maxFileSize)} each
                    {assignment.allowedFileTypes.length > 0 && (
                      <span> • Allowed: {assignment.allowedFileTypes.join(', ')}</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={submission ? handleUpdate : handleSubmit}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {submission ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {submission ? 'Update Submission' : 'Submit Assignment'}
                  </>
                )}
              </Button>
            </div>

            {isOverdue && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-sm text-red-800">
                  This assignment is overdue. Late submissions may be penalized.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cannot Submit Message */}
      {!canSubmit && !submission && (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Assignment Submission Closed
            </h3>
            <p className="text-gray-600">
              {isOverdue 
                ? 'This assignment is past due and no longer accepting submissions.'
                : 'This assignment has already been graded and cannot be resubmitted.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssignmentPlayer;