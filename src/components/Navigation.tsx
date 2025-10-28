'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown, GraduationCap, Briefcase, Shield, User, UserCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { MAIN_NAVIGATION } from '@/shared/config/navigation'
import UserAccessBadge from './UserAccessBadge'

export default function Navigation() {
  const { user, loading, signOut, isAdmin, isInstructor, isStudent } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false)
  const [isLMSDropdownOpen, setIsLMSDropdownOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const closeDropdowns = () => {
      setIsServicesDropdownOpen(false)
      setIsLMSDropdownOpen(false)
    }
    
    if (isServicesDropdownOpen || isLMSDropdownOpen) {
      document.addEventListener('click', closeDropdowns)
      return () => document.removeEventListener('click', closeDropdowns)
    }
  }, [isServicesDropdownOpen, isLMSDropdownOpen])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" aria-label="Main navigation">
        
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-2xl font-bold text-red-600 hover:text-red-700 transition-colors" aria-label="TechGetAfrica Home">
            TechGet<span className="text-black">Africa</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          
          {/* Primary Navigation - Education Focus */}
          {MAIN_NAVIGATION.primary.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="text-gray-700 hover:text-red-600 transition-colors font-medium"
              title={item.description}
            >
              {item.label}
            </Link>
          ))}

          {/* Services Dropdown - Secondary Business Lines */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="flex items-center text-gray-700 hover:text-red-600 transition-colors font-medium"
              onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
              aria-expanded={isServicesDropdownOpen}
              aria-haspopup="true"
            >
              Services <ChevronDown className="h-4 w-4 ml-1" />
            </button>
            {isServicesDropdownOpen && (
              <div className="absolute top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-20">
                {MAIN_NAVIGATION.services.map((service) => (
                  <Link 
                    key={service.href}
                    href={service.href} 
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors group"
                    onClick={() => setIsServicesDropdownOpen(false)}
                  >
                    {service.icon && <service.icon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-red-500" />}
                    <div>
                      <div className="font-medium">{service.label}</div>
                      {service.description && (
                        <div className="text-xs text-gray-500">{service.description}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* LMS Navigation - For Authenticated Users Only */}
          {user && !loading && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                className="flex items-center bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors font-medium px-3 py-2 rounded-lg border border-red-200"
                onClick={() => setIsLMSDropdownOpen(!isLMSDropdownOpen)}
                aria-expanded={isLMSDropdownOpen}
                aria-haspopup="true"
                title="Access your Learning Management System"
              >
                <GraduationCap className="h-5 w-5 mr-2" />
                LMS <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              {isLMSDropdownOpen && (
                <div className="absolute top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                  {/* Security Header */}
                  <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center text-xs text-gray-600">
                      <Shield className="h-3 w-3 mr-1" />
                      <span>Secure Access - Role: {user?.role}</span>
                    </div>
                  </div>
                  
                  {/* Student Access */}
                  <Link
                    href="/lms/student"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                    onClick={() => setIsLMSDropdownOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3 text-blue-500" />
                    <div>
                      <div className="font-medium">Student Dashboard</div>
                      <div className="text-xs text-gray-500">View courses & progress</div>
                    </div>
                  </Link>
                  
                  {/* Instructor Access */}
                  {(isInstructor() || isAdmin()) && (
                    <Link
                      href="/lms/instructor"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group"
                      onClick={() => setIsLMSDropdownOpen(false)}
                    >
                      <UserCheck className="h-4 w-4 mr-3 text-green-500" />
                      <div>
                        <div className="font-medium">Instructor Dashboard</div>
                        <div className="text-xs text-gray-500">Manage courses & students</div>
                      </div>
                    </Link>
                  )}
                  
                  {/* Admin Access */}
                  {isAdmin() && (
                    <Link
                      href="/lms/admin"
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors group"
                      onClick={() => setIsLMSDropdownOpen(false)}
                    >
                      <Shield className="h-4 w-4 mr-3 text-purple-500" />
                      <div>
                        <div className="font-medium">Admin Dashboard</div>
                        <div className="text-xs text-gray-500">System administration</div>
                      </div>
                    </Link>
                  )}
                  
                  {/* Footer note */}
                  <div className="px-4 py-2 border-t border-gray-100 mt-1">
                    <p className="text-xs text-gray-500">Access is role-based and secure</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Loading state for LMS */}
          {user && loading && (
            <div className="flex items-center px-3 py-2 bg-gray-100 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
              <span className="text-sm text-gray-600">Loading access...</span>
            </div>
          )}

          {/* Secondary Navigation */}
          <div className="hidden xl:flex items-center space-x-6 border-l border-gray-200 pl-6">
            {MAIN_NAVIGATION.secondary.slice(0, 2).map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="text-gray-500 hover:text-gray-900 transition-colors text-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          ) : user ? (
            <div className="flex items-center space-x-3">
              <UserAccessBadge />
              <span className="text-gray-700 text-sm">Hello, {user.profile.first_name || user.profile.name}</span>
              <button
                onClick={() => signOut()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/auth/sign-in">
                <button className="text-gray-700 hover:text-red-600 transition-colors font-medium">
                  Log In
                </button>
              </Link>
              <Link href="/auth/sign-up">
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            className="text-gray-700 hover:text-red-600 p-2"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 max-h-screen overflow-y-auto">
            
            {/* Primary Navigation */}
            <div className="border-b border-gray-100 pb-2 mb-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Education & Certifications
              </p>
              {MAIN_NAVIGATION.primary.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Services */}
            <div className="border-b border-gray-100 pb-2 mb-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Services
              </p>
              {MAIN_NAVIGATION.services.map((service) => (
                <Link 
                  key={service.href}
                  href={service.href} 
                  className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {service.label}
                </Link>
              ))}
            </div>

            {/* LMS Mobile Navigation */}
            {user && !loading && (
              <div className="border-b border-gray-100 pb-2 mb-2 bg-red-50 rounded-lg mx-2">
                <div className="px-3 py-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-red-600" />
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                    Learning Management System
                  </p>
                </div>
                <div className="px-2">
                  <p className="px-3 py-1 text-xs text-gray-600">Role: {user?.role} | Secure Access</p>
                  
                  {/* Student Access */}
                  <Link 
                    href="/lms/student"
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors m-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3 text-blue-500" />
                    <div>
                      <div className="font-medium text-sm">Student Dashboard</div>
                      <div className="text-xs text-gray-500">View courses & progress</div>
                    </div>
                  </Link>
                  
                  {/* Instructor Access */}
                  {(isInstructor() || isAdmin()) && (
                    <Link 
                      href="/lms/instructor"
                      className="flex items-center px-3 py-2 text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors m-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserCheck className="h-4 w-4 mr-3 text-green-500" />
                      <div>
                        <div className="font-medium text-sm">Instructor Dashboard</div>
                        <div className="text-xs text-gray-500">Manage courses & students</div>
                      </div>
                    </Link>
                  )}
                  
                  {/* Admin Access */}
                  {isAdmin() && (
                    <Link 
                      href="/lms/admin"
                      className="flex items-center px-3 py-2 text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors m-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield className="h-4 w-4 mr-3 text-purple-500" />
                      <div>
                        <div className="font-medium text-sm">Admin Dashboard</div>
                        <div className="text-xs text-gray-500">System administration</div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}
            
            {/* Mobile Loading state for LMS */}
            {user && loading && (
              <div className="border-b border-gray-100 pb-2 mb-2 mx-2">
                <div className="flex items-center px-3 py-3 bg-gray-100 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-3"></div>
                  <span className="text-sm text-gray-600">Loading LMS access permissions...</span>
                </div>
              </div>
            )}
            
            {/* Secondary Navigation */}
            <div className="border-b border-gray-100 pb-2 mb-2">
              {MAIN_NAVIGATION.secondary.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="px-3 py-2">
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ) : user ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-sm">Hello, {user.profile.first_name || user.profile.name}</span>
                  <button
                    onClick={() => signOut()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/sign-in">
                    <button className="w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors">
                      Log In
                    </button>
                  </Link>
                  <Link href="/auth/sign-up">
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md transition-colors font-medium">
                      Get Started
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}