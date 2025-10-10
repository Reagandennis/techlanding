'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, BookOpen, GraduationCap, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardProps {
  allowedRoles?: string[];
  fallbackComponent?: React.ReactNode;
}

export function RoleBasedDashboard({ allowedRoles = [], fallbackComponent }: DashboardProps) {
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      // Get user role from profile metadata or database
      const role = user.user_metadata?.role || user.app_metadata?.role || 'STUDENT';
      setUserRole(role);
      
      if (allowedRoles.length === 0 || allowedRoles.includes(role)) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    }
  }, [user, loading, allowedRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please log in to access the dashboard.{' '}
          <Link href="/auth/login" className="underline text-blue-600">
            Sign In
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-red-200">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-red-900">Access Restricted</CardTitle>
            <CardDescription>
              This dashboard requires {allowedRoles.join(' or ')} privileges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Your Role:</span>
                <Badge variant="outline">{userRole}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Required:</span>
                <div className="flex gap-1">
                  {allowedRoles.map(role => (
                    <Badge key={role} variant="destructive" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              {fallbackComponent && (
                <div className="pt-4 border-t">
                  {fallbackComponent}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getRoleDisplayName(userRole)} Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user.user_metadata?.name || user.email}
          </p>
        </div>
        <Badge variant="default" className="ml-auto">
          {userRole}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userRole === 'ADMIN' && <AdminDashboardCards />}
        {userRole === 'INSTRUCTOR' && <InstructorDashboardCards />}
        {userRole === 'STUDENT' && <StudentDashboardCards />}
      </div>
    </div>
  );
}

function AdminDashboardCards() {
  return (
    <>
      <DashboardCard
        title="User Management"
        description="Manage users, roles, and permissions"
        icon={<Users className="h-6 w-6" />}
        href="/admin/users"
        count="124 users"
      />
      <DashboardCard
        title="Course Management"
        description="Oversee all courses and content"
        icon={<BookOpen className="h-6 w-6" />}
        href="/admin/courses"
        count="32 courses"
      />
      <DashboardCard
        title="System Analytics"
        description="View platform analytics and reports"
        icon={<Shield className="h-6 w-6" />}
        href="/admin/analytics"
        count="View Reports"
      />
    </>
  );
}

function InstructorDashboardCards() {
  return (
    <>
      <DashboardCard
        title="My Courses"
        description="Manage your courses and content"
        icon={<BookOpen className="h-6 w-6" />}
        href="/instructor/courses"
        count="8 courses"
      />
      <DashboardCard
        title="Students"
        description="View enrolled students and progress"
        icon={<Users className="h-6 w-6" />}
        href="/instructor/students"
        count="156 students"
      />
      <DashboardCard
        title="Analytics"
        description="Course performance and engagement"
        icon={<Shield className="h-6 w-6" />}
        href="/instructor/analytics"
        count="View Stats"
      />
    </>
  );
}

function StudentDashboardCards() {
  return (
    <>
      <DashboardCard
        title="My Courses"
        description="Continue your learning journey"
        icon={<BookOpen className="h-6 w-6" />}
        href="/student/courses"
        count="4 enrolled"
      />
      <DashboardCard
        title="Progress"
        description="Track your learning progress"
        icon={<GraduationCap className="h-6 w-6" />}
        href="/student/progress"
        count="68% complete"
      />
      <DashboardCard
        title="Certificates"
        description="View your earned certificates"
        icon={<Shield className="h-6 w-6" />}
        href="/student/certificates"
        count="2 earned"
      />
    </>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  count: string;
}

function DashboardCard({ title, description, icon, href, count }: DashboardCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{count}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function getRoleDisplayName(role: string | null): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrator';
    case 'INSTRUCTOR':
      return 'Instructor';
    case 'STUDENT':
      return 'Student';
    default:
      return 'User';
  }
}