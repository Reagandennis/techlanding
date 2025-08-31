'use client';

import Link from 'next/link';
import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useBusinessVertical } from '../../context/BusinessVerticalContext';
import { navigationConfig } from '../../config/navigation';
import { BusinessVertical } from '../../types/business';

interface NavbarProps {
  vertical?: BusinessVertical;
}

export default function Navbar({ vertical }: NavbarProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { currentVertical } = useBusinessVertical();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get navigation items for current vertical
  const menuItems = navigationConfig.getMenuItems(vertical || currentVertical || 'default');
  const verticalNavigation = navigationConfig.getVerticalNavigation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" aria-label="Main navigation">
        {/* Brand Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-2xl font-bold text-red-600" aria-label="TechGetAfrica Home">
            TechGet<span className="text-black">Africa</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Primary Navigation */}
          {menuItems.primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-700 hover:text-red-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}

          {/* Business Verticals Dropdown (only show on homepage/default) */}
          {(!currentVertical || currentVertical === null) && verticalNavigation.length > 0 && (
            <div className="relative">
              <button
                className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                Services <ChevronDown className="h-5 w-5 ml-1" />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-20 border">
                  {verticalNavigation.map((vertical) => (
                    <Link
                      key={vertical.href}
                      href={vertical.href}
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="flex items-center">
                        {vertical.icon && <vertical.icon className="h-5 w-5 mr-3 text-red-600" />}
                        <div>
                          <div className="font-medium">{vertical.label}</div>
                          {vertical.description && (
                            <div className="text-xs text-gray-500 mt-1">{vertical.description}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Secondary Navigation */}
          {menuItems.secondary.length > 0 && (
            <div className="relative">
              <button
                className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                More <ChevronDown className="h-5 w-5 ml-1" />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                  {menuItems.secondary.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Authenticated User Links */}
          {isSignedIn && (
            <Link href="/certifications/all" className="text-gray-700 hover:text-red-600 transition-colors">
              My Certifications
            </Link>
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
            {/* Primary Navigation */}
            {menuItems.primary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Business Verticals */}
            {(!currentVertical || currentVertical === null) && verticalNavigation.map((vertical) => (
              <Link
                key={vertical.href}
                href={vertical.href}
                className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {vertical.label}
              </Link>
            ))}

            {/* Secondary Navigation */}
            {menuItems.secondary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Authenticated User Links */}
            {isSignedIn && (
              <Link
                href="/certifications/all"
                className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Certifications
              </Link>
            )}

            {/* Auth Section */}
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
  );
}
