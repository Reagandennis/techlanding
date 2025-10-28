'use client';

import React, { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BookOpen, 
  BarChart3, 
  Users, 
  Settings, 
  Home,
  GraduationCap,
  FileText,
  Calendar,
  Bell,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';

interface LMSLayoutProps {
  children: React.ReactNode;
  userRole?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

const LMSLayout: React.FC<LMSLayoutProps> = ({ children, userRole = 'STUDENT' }) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      { name: 'Dashboard', href: `/lms/${userRole.toLowerCase()}`, icon: Home },
      { name: 'My Courses', href: `/lms/${userRole.toLowerCase()}/courses`, icon: BookOpen },
      { name: 'Progress', href: `/lms/${userRole.toLowerCase()}/progress`, icon: BarChart3 },
      { name: 'Calendar', href: `/lms/${userRole.toLowerCase()}/calendar`, icon: Calendar },
    ];

    if (userRole === 'ADMIN') {
      return [
        ...commonItems,
        { name: 'Users', href: '/lms/admin/users', icon: Users },
        { name: 'All Courses', href: '/lms/admin/courses', icon: GraduationCap },
        { name: 'Reports', href: '/lms/admin/reports', icon: FileText },
        { name: 'Settings', href: '/lms/admin/settings', icon: Settings },
      ];
    } else if (userRole === 'INSTRUCTOR') {
      return [
        ...commonItems,
        { name: 'My Students', href: '/lms/instructor/students', icon: Users },
        { name: 'Course Management', href: '/lms/instructor/manage', icon: GraduationCap },
        { name: 'Assignments', href: '/lms/instructor/assignments', icon: FileText },
        { name: 'Analytics', href: '/lms/instructor/analytics', icon: BarChart3 },
      ];
    } else {
      return [
        ...commonItems,
        { name: 'Assignments', href: '/lms/student/assignments', icon: FileText },
        { name: 'Certificates', href: '/lms/student/certificates', icon: GraduationCap },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TechGet<span className="text-red-600">Africa</span> <span className="text-sm text-gray-600">LMS</span></span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User role badge and back to website */}
        <div className="absolute bottom-6 left-4 right-4 space-y-3">
          <Link 
            href="/"
            className="flex items-center space-x-2 p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Website</span>
          </Link>
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                userRole === 'ADMIN' ? 'bg-red-500' : 
                userRole === 'INSTRUCTOR' ? 'bg-red-400' : 'bg-red-600'
              }`} />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                {userRole}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Search Bar */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-50 rounded-lg px-4 py-2 w-80">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, assignments..."
                  className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 flex-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">3</span>
                </span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                >
                  <img
                    src={user?.imageUrl || '/api/placeholder/32/32'}
                    alt={user?.fullName || 'User'}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user?.firstName || 'User'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/lms/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/lms/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-1" />
                    <Link
                      href="/"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Website</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default LMSLayout;