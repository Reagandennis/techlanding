'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import LessonViewer from '@/components/lms/LessonViewer';

interface UserProgress {
  completedLessons: string[];
  currentLesson: string;
  overallProgress: number;
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const { user } = useUser();
  const router = useRouter();
  
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedLessons: [],
    currentLesson: '',
    overallProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && courseId) {
      checkEnrollmentAndProgress();
    }
  }, [user, courseId]);

  const checkEnrollmentAndProgress = async () => {
    setLoading(true);
    try {
      // Check enrollment status and get progress
      const response = await fetch(`/api/lms/student/enrollment/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setIsEnrolled(data.isEnrolled);
        setUserProgress({
          completedLessons: data.completedLessons || [],
          currentLesson: data.currentLesson || '',
          overallProgress: data.progress || 0,
        });
      } else {
        setIsEnrolled(false);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
      setIsEnrolled(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = async (lessonId: string) => {
    try {
      const response = await fetch('/api/lms/student/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          lessonId,
          isCompleted: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserProgress(prev => ({
          ...prev,
          completedLessons: [...prev.completedLessons, lessonId],
          overallProgress: data.overallProgress || prev.overallProgress,
        }));
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const handleProgressUpdate = async (lessonId: string, progress: number, timeWatched: number) => {
    try {
      await fetch('/api/lms/student/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          lessonId,
          progress,
          timeSpent: Math.round(timeWatched),
        }),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access this lesson.</p>
          <button
            onClick={() => router.push('/sign-in')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <LessonViewer
      courseId={courseId as string}
      lessonId={lessonId as string}
      isEnrolled={isEnrolled}
      userProgress={userProgress}
      onLessonComplete={handleLessonComplete}
      onProgressUpdate={handleProgressUpdate}
    />
  );
}