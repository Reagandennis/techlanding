'use client'

import Link from 'next/link'
import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown, GraduationCap, User, UserCheck, Shield } from 'lucide-react'
import { MAIN_NAVIGATION } from '@/shared/config/navigation'

export default function TestNavigation() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLMSDropdownOpen, setIsLMSDropdownOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" aria-label="Main navigation">
        
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-2xl font-bold text-red-600 hover:text-red-700 transition-colors">
            TechGet<span className="text-black">Africa</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          
          {/* Primary Navigation */}
          {MAIN_NAVIGATION.primary.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="text-gray-700 hover:text-red-600 transition-colors font-medium"
            >
              {item.label}
            </Link>
          ))}

          {/* LMS Dropdown - Always show if signed in (for testing) */}
          {isSignedIn && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                className="flex items-center bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors font-medium px-3 py-2 rounded-lg border border-red-200"
                onClick={() => setIsLMSDropdownOpen(!isLMSDropdownOpen)}
              >
                <GraduationCap className="h-5 w-5 mr-2" />
                LMS <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              {isLMSDropdownOpen && (
                <div className="absolute top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center text-xs text-gray-600">
                      <Shield className="h-3 w-3 mr-1" />
                      <span>Test Mode - All Access</span>
                    </div>
                  </div>
                  
                  <Link
                    href="/lms/student"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    onClick={() => setIsLMSDropdownOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3 text-blue-500" />
                    <div>
                      <div className="font-medium">Student Dashboard</div>
                      <div className="text-xs text-gray-500">View courses & progress</div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/lms/instructor"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                    onClick={() => setIsLMSDropdownOpen(false)}
                  >
                    <UserCheck className="h-4 w-4 mr-3 text-green-500" />
                    <div>
                      <div className="font-medium">Instructor Dashboard</div>
                      <div className="text-xs text-gray-500">Manage courses & students</div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/lms/admin"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    onClick={() => setIsLMSDropdownOpen(false)}
                  >
                    <Shield className="h-4 w-4 mr-3 text-purple-500" />
                    <div>
                      <div className="font-medium">Admin Dashboard</div>
                      <div className="text-xs text-gray-500">System administration</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Show sign in status for testing */}
          {isSignedIn && (
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
              ✅ Signed In: {user?.firstName || 'User'}
            </div>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          {!isLoaded ? (
            <div className="animate-pulse flex space-x-4">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          ) : isSignedIn ? (
            <div className="flex items-center space-x-3">
              <span className="text-gray-700 text-sm">Hello, {user.firstName || user.username}</span>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <SignInButton mode="modal">
                <button className="text-gray-700 hover:text-red-600 transition-colors font-medium">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            className="text-gray-700 hover:text-red-600 p-2"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>
    </header>
  )
}