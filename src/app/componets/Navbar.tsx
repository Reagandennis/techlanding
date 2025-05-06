'use client'

import Link from 'next/link'
import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'

export default function Navbar() {
  const { isLoaded, isSignedIn, user } = useUser()

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" aria-label="Main navigation">
        <div className="flex-shrink-0">
          <Link href="/" className="text-2xl font-bold text-red-600" aria-label="TechGetAfrica Home">
            TechGet<span className="text-black">Africa</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link href="/accreditation" className="text-gray-700 hover:text-red-600 transition-colors">Accreditation</Link>
          <Link href="/programs" className="text-gray-700 hover:text-red-600 transition-colors">Programs</Link>
          <Link href="/partners" className="text-gray-700 hover:text-red-600 transition-colors">Partners</Link>
          <Link href="/resources" className="text-gray-700 hover:text-red-600 transition-colors">Resources</Link>
          <Link href="/communities" className="text-gray-700 hover:text-red-600 transition-colors">Community</Link>
          {/* Add a link to the protected page if the user is signed in */}
          {isSignedIn && (
            <Link href="/certifications/all" className="text-gray-700 hover:text-red-600 transition-colors">My Certifications</Link>
          )}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {!isLoaded ? (
            // Show loading state while checking auth status
            <span>Loading...</span>
          ) : isSignedIn ? (
            // If user is signed in, show user info and UserButton
            <>
              {/* Display user's full name or username */}
              <span className="text-gray-700 text-sm">Hello, {user.firstName || user.username}</span>
              {/* Clerk's UserButton component for user menu */}
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            // If user is not signed in, show Sign In and Sign Up buttons
            <>
              <SignInButton mode="modal">
                <button className="text-gray-700 hover:text-red-600 transition-colors">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">
                  Get Started
                </button>
              </SignUpButton>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            className="text-gray-700 hover:text-red-600"
            aria-label="Open menu"
            aria-expanded="false"
            onClick={() => {/* Add mobile menu state toggle logic */}}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          {/* Mobile Menu would be implemented as a client component */}
        </div>
      </nav>
    </header>
  )
}