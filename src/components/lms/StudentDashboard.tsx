'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target, 
  Calendar,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Star,
  FileText,
  Video,
  Users,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

// Types
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  instructor: {
    name: string;
    avatar: string | null;
  };
  progress: {
    completedLessons: number;
    totalLessons: number;
    percentage: number;
    lastAccessedAt: string | null;
  };
  enrolledAt: string;
  category: {
    name: string;
    color: string;
  };
  totalDuration: number;
  certificateEarned: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  type: 'COURSE_COMPLETE' | 'QUIZ_MASTER' | 'STREAK' | 'FIRST_LESSON';
}

interface UpcomingItem {
  id: string;
  title: string;
  type: 'QUIZ' | 'ASSIGNMENT' | 'LESSON';
  dueDate: string;
  course: {
    id: string;
    title: string;
  };
  status: 'PENDING' | 'OVERDUE';
}

interface LearningStats {
  totalCoursesEnrolled: number;
  coursesCompleted: number;
  totalLearningTime: number;
  currentStreak: number;
  totalQuizzesPassed: number;
  totalAssignmentsSubmitted: number;
  averageScore: number;
}

interface RecentActivity {
  id: string;
  type: 'LESSON_COMPLETED' | 'QUIZ_PASSED' | 'ASSIGNMENT_SUBMITTED' | 'COURSE_ENROLLED';
  title: string;
  course: string;
  timestamp: string;
  score?: number;
}

interface StudentDashboardData {
  user: {
    name: string;
    email: string;
    avatar: string | null;
    joinedAt: string;
  };
  courses: Course[];
  achievements: Achievement[];
  upcomingItems: UpcomingItem[];
  stats: LearningStats;
  recentActivity: RecentActivity[];
}

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'progress' | 'achievements'>('overview');

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/lms/student/dashboard');
        if (!response.ok) {
          throw new Error('Failed to load dashboard');
        }
        
        const dashboardData = await response.json();
        setData(dashboardData);
        
      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'LESSON_COMPLETED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'QUIZ_PASSED': return <Trophy className="h-4 w-4 text-blue-600" />;
      case 'ASSIGNMENT_SUBMITTED': return <FileText className="h-4 w-4 text-purple-600" />;
      case 'COURSE_ENROLLED': return <BookOpen className="h-4 w-4 text-indigo-600" />;
      default: return <Star className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Unavailable</h3>
          <p className="text-gray-600">Unable to load your dashboard data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-2 border-white">
              <AvatarImage src={data.user.avatar || ''} alt={data.user.name} />
              <AvatarFallback className="bg-white text-blue-600 text-lg font-semibold">
                {data.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {data.user.name}!</h1>
              <p className="text-blue-100">
                Learning since {new Date(data.user.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{data.stats.currentStreak}</div>
            <div className="text-blue-100">Day Streak 🔥</div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses Enrolled</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalCoursesEnrolled}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses Completed</p>
                <p className="text-2xl font-bold text-green-600">{data.stats.coursesCompleted}</p>
              </div>
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Learning Time</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatDuration(data.stats.totalLearningTime)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-indigo-600">{data.stats.averageScore}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: Target },
            { id: 'courses', name: 'My Courses', icon: BookOpen },
            { id: 'progress', name: 'Progress', icon: TrendingUp },
            { id: 'achievements', name: 'Achievements', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Courses */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PlayCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Continue Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <img
                      src={course.thumbnailUrl || '/placeholder-course.jpg'}
                      alt={course.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.instructor.name}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Progress value={course.progress.percentage} className="flex-1" />
                        <span className="text-sm text-gray-600">
                          {course.progress.percentage}%
                        </span>
                      </div>
                    </div>
                    <Link href={`/courses/${course.id}`}>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
                {data.courses.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                    <p className="text-gray-600 mb-4">Start your learning journey today!</p>
                    <Link href="/courses">
                      <Button>Browse Courses</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.upcomingItems.length > 0 ? (
                  <div className="space-y-3">
                    {data.upcomingItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          item.status === 'OVERDUE' ? 'bg-red-500' : 'bg-orange-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-600">{item.course.title}</p>
                          <p className={`text-xs ${
                            item.status === 'OVERDUE' ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {item.status === 'OVERDUE' ? 'Overdue' : formatDate(item.dueDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No upcoming items</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600">{activity.course}</p>
                        <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                      </div>
                      {activity.score && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.score}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={course.thumbnailUrl || '/placeholder-course.jpg'}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {course.certificateEarned && (
                  <Badge className="absolute top-2 right-2 bg-green-600">
                    <Award className="h-3 w-3 mr-1" />
                    Certified
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {course.category.name}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDuration(course.totalDuration)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center space-x-2 mb-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={course.instructor.avatar || ''} />
                    <AvatarFallback className="text-xs">
                      {course.instructor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">{course.instructor.name}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900">{course.progress.percentage}%</span>
                  </div>
                  <Progress value={course.progress.percentage} />
                  <p className="text-xs text-gray-500">
                    {course.progress.completedLessons} of {course.progress.totalLessons} lessons
                  </p>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Link href={`/courses/${course.id}`} className="flex-1">
                    <Button className="w-full">Continue</Button>
                  </Link>
                  {course.certificateEarned && (
                    <Button variant="outline" size="sm">
                      <Award className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.achievements.map((achievement) => (
            <Card key={achievement.id} className="text-center p-6">
              <div className="text-4xl mb-4">{achievement.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{achievement.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
              <Badge variant="secondary">
                Earned {formatDate(achievement.earnedAt)}
              </Badge>
            </Card>
          ))}
          {data.achievements.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
              <p className="text-gray-600">Complete courses and quizzes to earn achievements!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;