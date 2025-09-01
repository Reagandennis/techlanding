'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessVertical } from '../../../../../../shared/context/BusinessVerticalContext';
import { Navbar } from '../../../../../../shared/components/layout/Navbar';
import { Button } from '../../../../../../shared/components/ui/Button';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, Maximize, CheckCircle2, Clock, BookOpen } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration: number;
  position: number;
  isFree: boolean;
  isPublished: boolean;
}

interface Course {
  id: string;
  title: string;
  instructor: {
    name: string;
    image?: string;
  };
  lessons: Lesson[];
}

interface Progress {
  id: string;
  isCompleted: boolean;
  watchTime: number;
  lastAccessed: string;
}

export default function LessonViewerPage({ 
  params 
}: { 
  params: { id: string; lessonId: string } 
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { setVertical } = useBusinessVertical();
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Set business vertical context
  useEffect(() => {
    setVertical('education');
  }, [setVertical]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    if (!user) return;

    const fetchLessonData = async () => {
      try {
        // Fetch course and lesson data
        const [courseResponse, progressResponse] = await Promise.all([
          fetch(`/api/courses/${params.id}`),
          fetch(`/api/lessons/${params.lessonId}/progress`)
        ]);

        if (courseResponse.ok) {
          const courseData = await courseResponse.json();
          setCourse(courseData.course);
          
          // Find the specific lesson
          const currentLesson = courseData.course.lessons.find(
            (l: Lesson) => l.id === params.lessonId
          );
          setLesson(currentLesson);
        }

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setProgress(progressData.progress);
          setVideoCurrentTime(progressData.progress?.watchTime || 0);
        }
      } catch (error) {
        console.error('Error fetching lesson data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonData();
  }, [user, params.id, params.lessonId]);

  const updateProgress = async (watchTime: number, isCompleted: boolean = false) => {
    if (!lesson) return;

    try {
      await fetch(`/api/lessons/${lesson.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          watchTime,
          isCompleted,
          lastAccessed: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const markLessonComplete = async () => {
    if (!lesson) return;
    
    await updateProgress(videoDuration, true);
    setProgress(prev => prev ? { ...prev, isCompleted: true } : null);
  };

  const navigateToLesson = (direction: 'prev' | 'next') => {
    if (!course || !lesson) return;

    const currentIndex = course.lessons.findIndex(l => l.id === lesson.id);
    let targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < course.lessons.length) {
      const targetLesson = course.lessons[targetIndex];
      router.push(`/courses/${params.id}/lessons/${targetLesson.id}`);
    }
  };

  const handleVideoTimeUpdate = (currentTime: number) => {
    setVideoCurrentTime(currentTime);
    
    // Auto-save progress every 10 seconds
    if (Math.floor(currentTime) % 10 === 0) {
      updateProgress(currentTime);
    }
  };

  const handleVideoEnded = () => {
    markLessonComplete();
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar vertical="education" />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar vertical="education" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Lesson not found</h1>
            <Button onClick={() => router.push(`/courses/${params.id}`)}>
              Back to Course
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentLessonIndex = course.lessons.findIndex(l => l.id === lesson.id);
  const hasNextLesson = currentLessonIndex < course.lessons.length - 1;
  const hasPrevLesson = currentLessonIndex > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar vertical="education" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => router.push('/courses')}
            className="hover:text-red-600"
          >
            Courses
          </button>
          <span>/</span>
          <button
            onClick={() => router.push(`/courses/${course.id}`)}
            className="hover:text-red-600"
          >
            {course.title}
          </button>
          <span>/</span>
          <span className="text-gray-900">{lesson.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Video Player */}
            {lesson.videoUrl ? (
              <div className="relative bg-black rounded-lg overflow-hidden mb-6">
                <video
                  className="w-full aspect-video"
                  controls
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement;
                    setVideoDuration(video.duration);
                    video.currentTime = videoCurrentTime;
                  }}
                  onTimeUpdate={(e) => {
                    const video = e.target as HTMLVideoElement;
                    handleVideoTimeUpdate(video.currentTime);
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={handleVideoEnded}
                >
                  <source src={lesson.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black bg-opacity-50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-white text-sm">
                      <span>
                        {Math.floor(videoCurrentTime / 60)}:
                        {Math.floor(videoCurrentTime % 60).toString().padStart(2, '0')} / 
                        {Math.floor(videoDuration / 60)}:
                        {Math.floor(videoDuration % 60).toString().padStart(2, '0')}
                      </span>
                      <div className="flex items-center space-x-2">
                        {progress?.isCompleted && (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center mb-6">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No video available for this lesson</p>
                </div>
              </div>
            )}

            {/* Lesson Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {lesson.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.duration} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>Lesson {lesson.position}</span>
                    </div>
                    {lesson.isFree && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Free
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Mark Complete Button */}
                {!progress?.isCompleted && (
                  <Button
                    onClick={markLessonComplete}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Complete</span>
                  </Button>
                )}
              </div>

              {lesson.description && (
                <div className="prose max-w-none">
                  <p className="text-gray-700">{lesson.description}</p>
                </div>
              )}

              {lesson.content && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Lesson Content</h3>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigateToLesson('prev')}
                disabled={!hasPrevLesson}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Lesson</span>
              </Button>

              <Button
                onClick={() => navigateToLesson('next')}
                disabled={!hasNextLesson}
                className="flex items-center space-x-2"
              >
                <span>Next Lesson</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Course Content</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {course.lessons.length} lessons
                </p>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {course.lessons.map((courseLesson, index) => (
                  <button
                    key={courseLesson.id}
                    onClick={() => router.push(`/courses/${course.id}/lessons/${courseLesson.id}`)}
                    className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                      courseLesson.id === lesson.id ? 'bg-red-50 border-l-4 border-l-red-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs text-gray-500">
                            {index + 1}.
                          </span>
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {courseLesson.title}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{courseLesson.duration} min</span>
                        </div>
                      </div>
                      
                      <div className="ml-2 flex-shrink-0">
                        {progress?.isCompleted && courseLesson.id === lesson.id ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : courseLesson.videoUrl ? (
                          <Play className="w-4 h-4 text-gray-400" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Course Info */}
            <div className="bg-white rounded-lg shadow p-4 mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Instructor</h3>
              <div className="flex items-center space-x-3">
                {course.instructor.image ? (
                  <img
                    src={course.instructor.image}
                    alt={course.instructor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {course.instructor.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {course.instructor.name}
                  </p>
                  <p className="text-xs text-gray-600">Course Instructor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
