'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LMSProtectedRoute from '@/components/LMSProtectedRoute';
import LMSLayout from '@/components/LMSLayout';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  BookOpen,
  Users,
  DollarSign,
  Calendar,
  Star,
  TrendingUp,
  Download
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string | null;
  price: number;
  discountPrice: number | null;
  currency: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
  language: string;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  totalModules: number;
  totalLessons: number;
  totalEnrollments: number;
  activeEnrollments: number;
  averageRating: number;
  totalReviews: number;
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const statusColors = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
};

const levelColors = {
  BEGINNER: 'bg-blue-100 text-blue-800',
  INTERMEDIATE: 'bg-purple-100 text-purple-800',
  ADVANCED: 'bg-red-100 text-red-800',
  ALL_LEVELS: 'bg-gray-100 text-gray-800',
};

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  useEffect(() => {
    fetchCourses();
  }, [pagination.page, searchTerm, statusFilter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/lms/instructor/courses?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCourses();
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-200 relative overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <BookOpen className="h-12 w-12" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[course.status]}`}>
            {course.status}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${levelColors[course.level]}`}>
            {course.level.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {course.shortDescription || course.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              {course.totalLessons}
            </span>
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {course.activeEnrollments}
            </span>
            {course.averageRating > 0 && (
              <span className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                {course.averageRating.toFixed(1)}
              </span>
            )}
          </div>
          <div className="font-semibold text-gray-900">
            {formatPrice(course.price, course.currency)}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Updated {formatDate(course.updatedAt)}
          </div>
          
          <div className="flex space-x-1">
            <Link
              href={`/lms/courses/${course.id}`}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Preview Course"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <Link
              href={`/lms/instructor/courses/${course.id}/edit`}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Edit Course"
            >
              <Edit className="h-4 w-4" />
            </Link>
            <button
              onClick={() => {/* TODO: Implement delete */}}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete Course"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CourseListItem = ({ course }: { course: Course }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <BookOpen className="h-8 w-8" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {course.title}
            </h3>
            <div className="flex items-center space-x-2 ml-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[course.status]}`}>
                {course.status}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${levelColors[course.level]}`}>
                {course.level.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {course.shortDescription || course.description}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>{course.totalLessons} lessons</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>{course.activeEnrollments} students</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>{formatPrice(course.price, course.currency)}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(course.updatedAt)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {course.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {course.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{course.tags.length - 3} more
                </span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Link
                href={`/lms/courses/${course.id}`}
                className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Link>
              <Link
                href={`/lms/instructor/courses/${course.id}/edit`}
                className="inline-flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <LMSProtectedRoute requiredSection="instructor">
      <LMSLayout currentSection="instructor">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
                <p className="text-gray-600">Create and manage your course content</p>
              </div>
              <Link
                href="/lms/instructor/courses/create"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Course
              </Link>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </form>

              {/* Filters and View Mode */}
              <div className="flex items-center space-x-4">
                {/* Status Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid'
                        ? 'bg-red-100 text-red-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-1 h-4 w-4">
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list'
                        ? 'bg-red-100 text-red-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="space-y-1 h-4 w-4">
                      <div className="bg-current h-1 rounded-sm"></div>
                      <div className="bg-current h-1 rounded-sm"></div>
                      <div className="bg-current h-1 rounded-sm"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{pagination.totalCount}</div>
                <div className="text-sm text-gray-500">Total Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {courses.filter(c => c.status === 'PUBLISHED').length}
                </div>
                <div className="text-sm text-gray-500">Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {courses.filter(c => c.status === 'DRAFT').length}
                </div>
                <div className="text-sm text-gray-500">Drafts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {courses.reduce((total, course) => total + course.activeEnrollments, 0)}
                </div>
                <div className="text-sm text-gray-500">Total Students</div>
              </div>
            </div>
          </div>

          {/* Course List */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="aspect-video bg-gray-200 animate-pulse"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No courses found' : 'No courses yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first course to get started'
                  }
                </p>
                <Link
                  href="/lms/instructor/courses/create"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Course
                </Link>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <CourseListItem key={course.id} course={course} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} courses
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                        className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded ${
                              pageNum === pagination.page
                                ? 'bg-red-600 text-white'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                        className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </LMSLayout>
    </LMSProtectedRoute>
  );
}