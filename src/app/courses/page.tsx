'use client'

import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function CoursesPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/courses?status=PUBLISHED', fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="p-8 text-red-600">Failed to load courses.</div>
  }

  const courses = data?.courses ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
          <button
            onClick={() => mutate()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-lg p-10 text-center text-gray-600">No courses yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 w-full bg-gray-100" />
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">{course.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>{course._count?.lessons ?? 0} lessons</span>
                    <span>{course._count?.enrollments ?? 0} learners</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-medium text-gray-900">{course.price > 0 ? `$${course.price}` : 'Free'}</span>
                    <Link href={`/lms/courses/${course.id}`} className="text-red-600 hover:text-red-700 font-medium">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


