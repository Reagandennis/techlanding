'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { 
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  FileText,
  CheckCircle2,
  Clock,
  Users,
  MessageSquare,
  Download,
  Bookmark,
  List,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import VideoPlayer from '@/components/VideoPlayer'
import Breadcrumb from '@/components/ui/Breadcrumb'

interface Course {
  id: string
  title: string
  description: string
  instructor: {
    id: string
    name: string
    image: string
    bio: string
  }
  modules: Module[]
  progress: number
  totalLessons: number
  completedLessons: number
}

interface Module {
  id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
  quizzes: Quiz[]
}

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  videoUrl?: string
  audioUrl?: string
  documentUrl?: string
  duration?: number
  order: number
  type: 'VIDEO' | 'TEXT' | 'DOCUMENT'
  isCompleted: boolean
  progress?: {
    timeSpent?: number
    completed: boolean
  }
}

interface Quiz {
  id: string
  title: string
  description: string
  totalQuestions: number
  passingScore: number
  isCompleted: boolean
  bestScore?: number
}

export default function CourseLearnPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const courseId = params.courseId as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentModule, setCurrentModule] = useState<Module | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId && user) {
      fetchCourseData()
    }
  }, [courseId, user])

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}?includeProgress=true`)
      if (response.ok) {
        const courseData = await response.json()
        setCourse(courseData)
        
        // Set initial lesson (first incomplete lesson or first lesson)
        const firstIncompleteLesson = findFirstIncompleteLesson(courseData.modules)
        if (firstIncompleteLesson) {
          setCurrentLesson(firstIncompleteLesson.lesson)
          setCurrentModule(firstIncompleteLesson.module)
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const findFirstIncompleteLesson = (modules: Module[]) => {
    for (const module of modules) {
      for (const lesson of module.lessons) {
        if (!lesson.isCompleted) {
          return { lesson, module }
        }
      }
    }
    // If all lessons are completed, return the first lesson
    if (modules.length > 0 && modules[0].lessons.length > 0) {
      return { lesson: modules[0].lessons[0], module: modules[0] }
    }
    return null
  }

  const getAllLessons = (): { lesson: Lesson; module: Module }[] => {
    if (!course) return []
    
    const allLessons: { lesson: Lesson; module: Module }[] = []
    course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        allLessons.push({ lesson, module })
      })
    })
    return allLessons.sort((a, b) => {
      if (a.module.order !== b.module.order) {
        return a.module.order - b.module.order
      }
      return a.lesson.order - b.lesson.order
    })
  }

  const navigateToLesson = (lesson: Lesson, module: Module) => {
    setCurrentLesson(lesson)
    setCurrentModule(module)
  }

  const navigateNext = () => {
    const allLessons = getAllLessons()
    const currentIndex = allLessons.findIndex(
      item => item.lesson.id === currentLesson?.id
    )
    
    if (currentIndex < allLessons.length - 1) {
      const nextItem = allLessons[currentIndex + 1]
      navigateToLesson(nextItem.lesson, nextItem.module)
    }
  }

  const navigatePrevious = () => {
    const allLessons = getAllLessons()
    const currentIndex = allLessons.findIndex(
      item => item.lesson.id === currentLesson?.id
    )
    
    if (currentIndex > 0) {
      const prevItem = allLessons[currentIndex - 1]
      navigateToLesson(prevItem.lesson, prevItem.module)
    }
  }

  const markLessonComplete = async (lessonId: string) => {
    try {
      await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      })
      
      // Update local state
      if (course) {
        const updatedCourse = { ...course }
        updatedCourse.modules.forEach(module => {
          module.lessons.forEach(lesson => {
            if (lesson.id === lessonId) {
              lesson.isCompleted = true
            }
          })
        })
        setCourse(updatedCourse)
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200"></div>
          <div className="flex">
            <div className="w-80 h-screen bg-gray-200"></div>
            <div className="flex-1 p-8">
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/courses')}>
            Browse Courses
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <List className="h-4 w-4" />
            </Button>
            <Breadcrumb
              items={[
                { label: 'Courses', href: '/courses' },
                { label: course.title, href: `/courses/${course.id}` },
                { label: 'Learn' }
              ]}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {course.completedLessons} of {course.totalLessons} lessons
              </span>
              <Progress value={(course.completedLessons / course.totalLessons) * 100} className="w-24" />
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/courses/${course.id}`)}
            >
              Course Overview
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Course Content</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {course.modules.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {module.title}
                    </h3>
                    
                    <div className="space-y-1">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => navigateToLesson(lesson, module)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            currentLesson?.id === lesson.id
                              ? 'bg-blue-50 border-2 border-blue-200'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {lesson.isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : lesson.type === 'VIDEO' ? (
                              <PlayCircle className="h-5 w-5 text-gray-400" />
                            ) : (
                              <FileText className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {lesson.title}
                            </p>
                            {lesson.duration && (
                              <p className="text-xs text-gray-500">
                                {formatDuration(lesson.duration)}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                      
                      {module.quizzes.map((quiz) => (
                        <button
                          key={quiz.id}
                          className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50"
                        >
                          <div className="flex-shrink-0">
                            {quiz.isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <MessageSquare className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {quiz.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {quiz.totalQuestions} questions • {quiz.passingScore}% to pass
                            </p>
                          </div>
                          
                          {quiz.bestScore && (
                            <Badge variant="secondary">
                              {quiz.bestScore}%
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {currentLesson ? (
            <div className="h-full flex flex-col">
              {/* Video/Content Area */}
              <div className="bg-black">
                {currentLesson.type === 'VIDEO' && currentLesson.videoUrl ? (
                  <VideoPlayer
                    src={currentLesson.videoUrl}
                    lessonId={currentLesson.id}
                    courseId={course.id}
                    title={currentLesson.title}
                    duration={currentLesson.duration}
                    onComplete={() => markLessonComplete(currentLesson.id)}
                  />
                ) : (
                  <div className="aspect-video flex items-center justify-center">
                    <div className="text-center text-white">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Content lesson</p>
                      <p className="text-sm opacity-75">Read the content below</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Details */}
              <div className="flex-1 bg-white">
                <div className="max-w-4xl mx-auto p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{currentModule?.title}</Badge>
                        {currentLesson.isCompleted && (
                          <Badge className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {currentLesson.title}
                      </h1>
                      {currentLesson.description && (
                        <p className="text-gray-600 mt-2">{currentLesson.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!currentLesson.isCompleted && (
                        <Button
                          onClick={() => markLessonComplete(currentLesson.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>

                  <Tabs defaultValue="content" className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="resources">Resources</TabsTrigger>
                      <TabsTrigger value="discussion">Discussion</TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="space-y-6">
                      {currentLesson.content && (
                        <Card>
                          <CardContent className="p-6">
                            <div 
                              className="prose max-w-none"
                              dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                            />
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="resources" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Lesson Resources</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {currentLesson.documentUrl && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-gray-500" />
                                <span className="font-medium">Lesson Materials</span>
                              </div>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          )}
                          
                          {currentLesson.audioUrl && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <PlayCircle className="h-5 w-5 text-gray-500" />
                                <span className="font-medium">Audio Version</span>
                              </div>
                              <Button variant="outline" size="sm">
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Play
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="discussion" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Discussion</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">
                            Discussion forum coming soon! Share your thoughts and questions about this lesson.
                          </p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-8 border-t">
                    <Button
                      variant="outline"
                      onClick={navigatePrevious}
                      disabled={getAllLessons().findIndex(item => item.lesson.id === currentLesson?.id) === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <Button
                      onClick={navigateNext}
                      disabled={getAllLessons().findIndex(item => item.lesson.id === currentLesson?.id) === getAllLessons().length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No lessons available</h2>
                <p className="text-gray-600">This course doesn't have any lessons yet.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}