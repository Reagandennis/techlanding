'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VideoPlayer from './VideoPlayer';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  FileText,
  Play,
  BookOpen,
  Download,
  ExternalLink,
  MessageSquare,
  Star,
  Lock
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'TEXT' | 'VIDEO' | 'QUIZ' | 'ASSIGNMENT' | 'DOCUMENT';
  content?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  documentUrl?: string;
  duration?: number;
  order: number;
  isPublished: boolean;
  isFree: boolean;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    id: string;
    name: string;
    image?: string;
  };
  modules: Module[];
}

interface LessonViewerProps {
  courseId: string;
  lessonId: string;
  isEnrolled: boolean;
  userProgress: {
    completedLessons: string[];
    currentLesson: string;
    overallProgress: number;
  };
  onLessonComplete: (lessonId: string) => void;
  onProgressUpdate: (lessonId: string, progress: number, timeWatched: number) => void;
}

export default function LessonViewer({
  courseId,
  lessonId,
  isEnrolled,
  userProgress,
  onLessonComplete,
  onProgressUpdate,
}: LessonViewerProps) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId, lessonId]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/lms/courses/${courseId}`);
      if (response.ok) {
        const courseData = await response.json();
        setCourse(courseData);
        
        // Find current lesson and module
        let foundLesson: Lesson | null = null;
        let foundModule: Module | null = null;
        
        for (const module of courseData.modules) {
          const lesson = module.lessons.find((l: Lesson) => l.id === lessonId);
          if (lesson) {
            foundLesson = lesson;
            foundModule = module;
            break;
          }
        }
        
        setCurrentLesson(foundLesson);
        setCurrentModule(foundModule);
        
        // Load saved notes
        const savedNotes = localStorage.getItem(`lesson_notes_${lessonId}`);
        if (savedNotes) {
          setNotes(savedNotes);
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonProgress = (progress: number, timeWatched: number) => {
    if (currentLesson) {
      onProgressUpdate(currentLesson.id, progress, timeWatched);
      
      // Auto-complete lesson when 90% watched
      if (progress >= 90 && !userProgress.completedLessons.includes(currentLesson.id)) {
        onLessonComplete(currentLesson.id);
      }
    }
  };

  const handleLessonVideoComplete = () => {
    if (currentLesson && !userProgress.completedLessons.includes(currentLesson.id)) {
      onLessonComplete(currentLesson.id);
    }
  };

  const markLessonComplete = () => {
    if (currentLesson && !userProgress.completedLessons.includes(currentLesson.id)) {
      onLessonComplete(currentLesson.id);
    }
  };

  const navigateToLesson = (lesson: Lesson) => {
    // Check if user can access this lesson
    if (!lesson.isFree && !isEnrolled) {
      return;
    }
    
    router.push(`/lms/courses/${courseId}/learn/${lesson.id}`);
  };

  const getNextLesson = (): Lesson | null => {
    if (!course || !currentLesson) return null;
    
    let allLessons: Lesson[] = [];
    course.modules.forEach(module => {
      allLessons = [...allLessons, ...module.lessons.sort((a, b) => a.order - b.order)];
    });
    
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = (): Lesson | null => {
    if (!course || !currentLesson) return null;
    
    let allLessons: Lesson[] = [];
    course.modules.forEach(module => {
      allLessons = [...allLessons, ...module.lessons.sort((a, b) => a.order - b.order)];
    });
    
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  const saveNotes = () => {
    localStorage.setItem(`lesson_notes_${lessonId}`, notes);
    // TODO: Also save to database
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const canAccessLesson = (lesson: Lesson) => {
    return lesson.isFree || isEnrolled;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600" />
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson not found</h2>
          <p className="text-gray-600 mb-4">This lesson may not exist or you may not have access to it.</p>
          <button
            onClick={() => router.push(`/lms/courses/${courseId}`)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Course Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarOpen ? 'w-80' : 'w-0'
      } overflow-hidden`}>
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => router.push(`/lms/courses/${courseId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Course
          </button>
          <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${userProgress.overallProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">{Math.round(userProgress.overallProgress)}% Complete</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {course.modules.map((module) => (
            <div key={module.id} className="border-b border-gray-100">
              <div className="p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900">{module.title}</h4>
                <p className="text-sm text-gray-600">
                  {module.lessons.filter(l => userProgress.completedLessons.includes(l.id)).length} / {module.lessons.length} lessons
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {module.lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      lesson.id === currentLesson.id ? 'bg-red-50 border-r-2 border-red-500' : ''
                    }`}
                    onClick={() => canAccessLesson(lesson) ? navigateToLesson(lesson) : null}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          {userProgress.completedLessons.includes(lesson.id) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : lesson.type === 'VIDEO' ? (
                            <Play className="w-5 h-5 text-gray-400" />
                          ) : lesson.type === 'TEXT' ? (
                            <FileText className="w-5 h-5 text-gray-400" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium truncate ${
                            canAccessLesson(lesson) ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {lesson.duration && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDuration(lesson.duration)}
                              </span>
                            )}
                            {lesson.isFree && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                Free
                              </span>
                            )}
                            {!canAccessLesson(lesson) && (
                              <Lock className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BookOpen className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{currentLesson.title}</h1>
                <p className="text-sm text-gray-600">{currentModule?.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                  showNotes ? 'bg-gray-100' : ''
                }`}
              >
                <MessageSquare className="w-5 h-5 text-gray-600" />
              </button>
              
              {!userProgress.completedLessons.includes(currentLesson.id) && currentLesson.type !== 'VIDEO' && (
                <button
                  onClick={markLessonComplete}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Lesson Description */}
              {currentLesson.description && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800">{currentLesson.description}</p>
                </div>
              )}

              {/* Content based on lesson type */}
              {currentLesson.type === 'VIDEO' && currentLesson.videoUrl && (
                <div className="mb-6">
                  <VideoPlayer
                    videoUrl={currentLesson.videoUrl}
                    title={currentLesson.title}
                    lessonId={currentLesson.id}
                    courseId={courseId}
                    duration={currentLesson.duration}
                    thumbnail={currentLesson.videoThumbnail}
                    onProgress={handleLessonProgress}
                    onComplete={handleLessonVideoComplete}
                    autoPlay={false}
                    allowSpeedControl={true}
                  />
                </div>
              )}

              {currentLesson.type === 'TEXT' && currentLesson.content && (
                <div className="prose max-w-none mb-6">
                  <div 
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                    className="text-gray-900 leading-relaxed"
                  />
                </div>
              )}

              {currentLesson.type === 'DOCUMENT' && currentLesson.documentUrl && (
                <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-gray-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">Course Document</h3>
                        <p className="text-sm text-gray-600">Download or view the lesson material</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={currentLesson.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </a>
                      <a
                        href={currentLesson.documentUrl}
                        download
                        className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {currentLesson.type === 'QUIZ' && (
                <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Star className="w-8 h-8 text-yellow-600" />
                    <div>
                      <h3 className="font-medium text-yellow-900">Quiz Available</h3>
                      <p className="text-sm text-yellow-800">Test your knowledge with this lesson quiz</p>
                    </div>
                  </div>
                  <button className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Take Quiz
                  </button>
                </div>
              )}

              {currentLesson.type === 'ASSIGNMENT' && (
                <div className="mb-6 p-6 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-purple-600" />
                    <div>
                      <h3 className="font-medium text-purple-900">Assignment</h3>
                      <p className="text-sm text-purple-800">Complete the assignment and submit for review</p>
                    </div>
                  </div>
                  <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    View Assignment
                  </button>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="border-t border-gray-200 p-6 bg-white">
              <div className="flex items-center justify-between">
                {previousLesson ? (
                  <button
                    onClick={() => navigateToLesson(previousLesson)}
                    disabled={!canAccessLesson(previousLesson)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Previous</p>
                      <p className="text-xs text-gray-500 truncate max-w-32">{previousLesson.title}</p>
                    </div>
                  </button>
                ) : (
                  <div></div>
                )}

                {nextLesson ? (
                  <button
                    onClick={() => navigateToLesson(nextLesson)}
                    disabled={!canAccessLesson(nextLesson)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <div className="text-right">
                      <p className="text-sm font-medium">Next</p>
                      <p className="text-xs text-gray-500 truncate max-w-32">{nextLesson.title}</p>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">🎉 Course Complete!</p>
                    <p className="text-xs text-gray-500">You've finished all lessons</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes Sidebar */}
          {showNotes && (
            <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">My Notes</h3>
                <p className="text-sm text-gray-600">Private notes for this lesson</p>
              </div>
              <div className="flex-1 p-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={saveNotes}
                  placeholder="Add your notes here..."
                  className="w-full h-full resize-none border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}