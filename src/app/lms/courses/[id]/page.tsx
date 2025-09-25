
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { BookOpen, Play, CheckCircle, Lock } from 'lucide-react'
import Link from 'next/link'

export default function CoursePage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId) {
      fetchCourseData()
    }
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/lms/courses/${courseId}`)
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
      } else {
        console.error('Failed to fetch course data')
      }
    } catch (error) {
      console.error('Error fetching course data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading course...</div>
  }

  if (!course) {
    return <div>Course not found.</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <p className="text-sm text-gray-500">Instructor: {course.instructor.name}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Content</h2>
        <ul className="space-y-4">
          {course.lessons.map((item: any, index: number) => (
            <li key={item.id}>
              <Link href={item.quiz ? `/lms/quiz/${item.quiz.id}` : `/lms/lessons/${item.id}`} passHref>
                <div className={`flex items-center space-x-4 p-4 border border-gray-200 rounded-lg transition-colors ${item.isLocked ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'}`}>
                  <div className="flex-shrink-0">
                    {item.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : item.isLocked ? (
                      <Lock className="h-6 w-6 text-gray-400" />
                    ) : (
                      <Play className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-medium ${item.isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">{item.quiz ? 'QUIZ' : item.type}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {index + 1}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
