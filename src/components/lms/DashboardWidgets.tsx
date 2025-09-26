'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Users, 
  CheckCircle,
  AlertCircle,
  Calendar,
  PlayCircle,
  Award
} from 'lucide-react';

// Welcome Card
interface WelcomeCardProps {
  userName: string;
  userRole: string;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName, userRole }) => (
  <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white">
    <h2 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h2>
    <p className="text-red-100 mb-4">
      {userRole === 'STUDENT' && "Ready to continue your learning journey?"}
      {userRole === 'INSTRUCTOR' && "Let's inspire minds and shape the future."}
      {userRole === 'ADMIN' && "Manage your learning platform with ease."}
    </p>
    <div className="flex items-center space-x-4">
      <div className="text-sm">
        <div className="font-semibold">Today</div>
        <div className="text-red-100">{new Date().toLocaleDateString()}</div>
      </div>
    </div>
  </div>
);

// Stats Card
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">
              <TrendingUp className="inline h-4 w-4 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// Course Progress Card
interface CourseProgressProps {
  courses: Array<{
    id: string;
    title: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    thumbnail?: string;
  }>;
}

export const CourseProgress: React.FC<CourseProgressProps> = ({ courses }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>
    <div className="space-y-4">
      {courses.map((course) => (
        <div key={course.id} className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            {course.thumbnail ? (
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <BookOpen className="h-6 w-6 text-gray-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">{course.title}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              <span className="text-xs text-gray-500">
                {course.completedLessons}/{course.totalLessons}
              </span>
            </div>
          </div>
          <Link 
            href={`/lms/courses/${course.id}`}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Continue
          </Link>
        </div>
      ))}
    </div>
  </div>
);

// Recent Activity
interface ActivityItem {
  id: string;
  type: 'course_completed' | 'assignment_submitted' | 'quiz_passed' | 'certificate_earned';
  title: string;
  description: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'course_completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'assignment_submitted':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'quiz_passed':
        return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'certificate_earned':
        return <Award className="h-5 w-5 text-purple-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
        )}
      </div>
    </div>
  );
};

// Upcoming Deadlines
interface DeadlineItem {
  id: string;
  title: string;
  type: 'assignment' | 'quiz' | 'project';
  dueDate: string;
  courseTitle: string;
}

interface UpcomingDeadlinesProps {
  deadlines: DeadlineItem[];
}

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ deadlines }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
      <Link href="/lms/calendar" className="text-sm text-red-600 hover:text-red-700">
        View all
      </Link>
    </div>
    <div className="space-y-3">
      {deadlines.map((deadline) => (
        <div key={deadline.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
          <div className="flex-shrink-0">
            <Calendar className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{deadline.title}</p>
            <p className="text-xs text-gray-600">{deadline.courseTitle}</p>
          </div>
          <div className="text-xs text-red-600 font-medium">
            {deadline.dueDate}
          </div>
        </div>
      ))}
      {deadlines.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No upcoming deadlines</p>
      )}
    </div>
  </div>
);

// Quick Actions
interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const colorClasses = {
    blue: 'bg-red-600 hover:bg-red-700',
    green: 'bg-red-500 hover:bg-red-600',
    yellow: 'bg-red-400 hover:bg-red-500',
    purple: 'bg-red-700 hover:bg-red-800'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className={`${colorClasses[action.color]} text-white p-4 rounded-lg transition-colors group`}
          >
            <div className="flex items-center space-x-3">
              <action.icon className="h-6 w-6" />
              <div>
                <p className="font-medium">{action.title}</p>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};