'use client';

import React from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export type UserRole = 'admin' | 'instructor' | 'student';

interface RoleConfig {
  requiredRole: UserRole | UserRole[];
  redirectTo?: string;
  fallbackRole?: UserRole;
}

export function useRoleAccess(config: RoleConfig) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Get user role from Clerk metadata
  const getUserRole = (): UserRole => {
    if (!user) return 'student';
    
    // Check both metadata and publicMetadata for role
    const role = user.publicMetadata?.role || 
                 user.privateMetadata?.role || 
                 user.unsafeMetadata?.role;
    
    return (role as UserRole) || config.fallbackRole || 'student';
  };

  const userRole = getUserRole();

  // Check if user has required role
  const hasAccess = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  };

  // Check specific role permissions
  const isAdmin = userRole === 'admin';
  const isInstructor = userRole === 'instructor' || userRole === 'admin';
  const isStudent = !!user; // Any authenticated user is at least a student

  useEffect(() => {
    if (isLoaded && user && config.requiredRole) {
      const hasRequiredAccess = hasAccess(config.requiredRole);
      
      if (!hasRequiredAccess && config.redirectTo) {
        router.push(config.redirectTo);
      }
    }
  }, [isLoaded, user, userRole, config.requiredRole, config.redirectTo, router]);

  return {
    user,
    userRole,
    isLoaded,
    hasAccess,
    isAdmin,
    isInstructor,
    isStudent,
  };
}

// Utility function to check role access in components
export function checkRoleAccess(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  // Admin has access to everything
  if (userRole === 'admin') return true;
  
  // Instructor has access to instructor and student routes
  if (userRole === 'instructor' && ['instructor', 'student'].includes(requiredRole)) {
    return true;
  }
  
  // Student has access to student routes
  if (userRole === 'student' && requiredRole === 'student') {
    return true;
  }
  
  return userRole === requiredRole;
}

// Higher-order component for role-based access
export function withRoleAccess<T extends object>(
  Component: React.ComponentType<T>,
  config: RoleConfig
) {
  return function RoleProtectedComponent(props: T) {
    const { hasAccess, isLoaded, userRole } = useRoleAccess(config);

    if (!isLoaded) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!hasAccess(config.requiredRole)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You need {Array.isArray(config.requiredRole) ? config.requiredRole.join(' or ') : config.requiredRole} access to view this page.
            </p>
            <p className="text-sm text-gray-500">Your current role: {userRole}</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Custom hook for role-specific redirects
export function useRoleDashboard() {
  const { userRole, isLoaded } = useRoleAccess({ requiredRole: 'student' });
  const router = useRouter();

  const redirectToDashboard = () => {
    if (!isLoaded) return;

    switch (userRole) {
      case 'admin':
        router.push('/admin/dashboard');
        break;
      case 'instructor':
        router.push('/instructor/dashboard');
        break;
      case 'student':
      default:
        router.push('/student/dashboard');
        break;
    }
  };

  return {
    userRole,
    isLoaded,
    redirectToDashboard,
    getDashboardUrl: () => {
      switch (userRole) {
        case 'admin':
          return '/admin/dashboard';
        case 'instructor':
          return '/instructor/dashboard';
        case 'student':
        default:
          return '/student/dashboard';
      }
    }
  };
}