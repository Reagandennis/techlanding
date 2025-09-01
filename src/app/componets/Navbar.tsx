
// Navbar component for TechGetAfrica
'use client'

import Link from 'next/link'
import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import { useState } from 'react'
import { Menu, X, ChevronDown, GraduationCap } from 'lucide-react'
import { useUserRole } from '@/hooks/useUserRole'

export default function Navbar() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { canAccessStudent, canAccessInstructor, canAccessAdmin } = useUserRole()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLMSDropdownOpen, setIsLMSDropdownOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" aria-label="Main navigation">
        <div className="flex-shrink-0">
          <Link href="/" className="text-2xl font-bold text-red-600" aria-label="TechGetAfrica Home">
            TechGet<span className="text-black">Africa</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/programs" className="text-gray-700 hover:text-red-600 transition-colors">Programs</Link>
          <Link href="/consulting" className="text-gray-700 hover:text-red-600 transition-colors">Consulting</Link>
          <Link href="/accreditation" className="text-gray-700 hover:text-red-600 transition-colors">Accreditation</Link>

          <div 
            className="relative">
            <button
              className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              More <ChevronDown className="h-5 w-5 ml-1" />
            </button>
            {isDropdownOpen && (
              <div
                className="absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20"
              >
                <Link href="/partners" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Partners</Link>
                <Link href="/resources" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Resources</Link>
                <Link href="/communities" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Community</Link>
                <Link href="/development" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Development</Link>
                <Link href="/recruitment" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Recruitment Agency Platform</Link>
              </div>
            )}
          </div>

          {/* LMS Navigation - Only show if user has access */}
          {isSignedIn && (canAccessStudent || canAccessInstructor || canAccessAdmin) && (
            <div className="relative">
              <button
                className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
                onClick={() => setIsLMSDropdownOpen(!isLMSDropdownOpen)}
              >
                <GraduationCap className="h-5 w-5 mr-1" />
                LMS <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              {isLMSDropdownOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                  {canAccessStudent && (
                    <Link
                      href="/lms/student"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsLMSDropdownOpen(false)}
                    >
                      Student Dashboard
                    </Link>
                  )}
                  {canAccessInstructor && (
                    <Link
                      href="/lms/instructor"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsLMSDropdownOpen(false)}
                    >
                      Instructor Dashboard
                    </Link>
                  )}
                  {canAccessAdmin && (
                    <Link
                      href="/lms/admin"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsLMSDropdownOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {isSignedIn && (
            <Link href="/certifications/all" className="text-gray-700 hover:text-red-600 transition-colors">My Certifications</Link>
          )}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {!isLoaded ? (
            <div className="animate-pulse flex space-x-4">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          ) : isSignedIn ? (
            <>
              <span className="text-gray-700 text-sm">Hello, {user.firstName || user.username}</span>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="text-gray-700 hover:text-red-600 transition-colors">Log In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">Get Started</button>
              </SignUpButton>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
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
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/programs" className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md">Programs</Link>
            <Link href="/consulting" className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md">Consulting</Link>
            <Link href="/accreditation" className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md">Accreditation</Link>
            <Link href="/partners" className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md">Partners</Link>
            <Link href="/resources" className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md">Resources</Link>
            <Link href="/communities" className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md">Community</Link>
            <Link href="/development" className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md">Development</Link>
            <Link href="/recruitment" className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md">Recruitment Agency Platform</Link>
            {/* LMS Mobile Navigation */}
            {isSignedIn && (canAccessStudent || canAccessInstructor || canAccessAdmin) && (
              <div className="border-t pt-2 mt-2">
                <p className="px-3 py-1 text-sm font-medium text-gray-500">Learning Management</p>
                {canAccessStudent && (
                  <Link href="/lms/student" className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md">Student Dashboard</Link>
                )}
                {canAccessInstructor && (
                  <Link href="/lms/instructor" className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md">Instructor Dashboard</Link>
                )}
                {canAccessAdmin && (
                  <Link href="/lms/admin" className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md">Admin Dashboard</Link>
                )}
              </div>
            )}
            
            {isSignedIn && (
              <Link href="/certifications/all" className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md">My Certifications</Link>
            )}
            <div className="border-t pt-2 mt-2">
              {!isLoaded ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ) : isSignedIn ? (
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Hello, {user.firstName || user.username}</span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 px-3">
                  <SignInButton mode="modal">
                    <button className="w-full text-left px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md">Log In</button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md transition-colors">Get Started</button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
