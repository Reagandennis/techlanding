'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft, BookOpen, Users, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      

      <main className="flex-grow">
        {/* 404 Hero Section */}
        <section className="relative bg-gradient-to-b from-gray-50 to-white pt-20 pb-24 px-4 sm:px-6 lg:pt-28 lg:pb-32 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <div className="absolute right-0 bottom-0 w-1/3 h-1/3 bg-red-50 rounded-tl-3xl opacity-70"></div>
            <div className="absolute left-0 top-0 w-1/4 h-1/4 bg-gray-100 rounded-br-3xl"></div>
          </div>
          
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center">
              <div className="mb-8">
                <div className="text-8xl font-bold text-red-600 mb-4">404</div>
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Oops! Page</span>
                  <span className="block text-red-600">Not Found</span>
                </h1>
              </div>
              
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/" variant="primary" className="flex items-center justify-center">
                  <Home className="h-5 w-5 mr-2" />
                  Go Home
                </Button>
                <Button href="/courses" variant="outline" className="flex items-center justify-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Browse Courses
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Helpful Links Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Maybe you were looking for...
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Here are some popular pages that might help you find what you need
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Popular Pages */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">Courses</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Explore our comprehensive tech certification courses designed for African professionals.
                </p>
                <Link href="/courses" className="text-red-600 hover:text-red-700 font-medium flex items-center">
                  Browse Courses
                  <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
                </Link>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">Community</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Join 50,000+ tech professionals in Africa's most vibrant tech community.
                </p>
                <Link href="/communities" className="text-red-600 hover:text-red-700 font-medium flex items-center">
                  Join Community
                  <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
                </Link>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Search className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">Programs</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Discover our accelerator and training programs to advance your tech career.
                </p>
                <Link href="/programs" className="text-red-600 hover:text-red-700 font-medium flex items-center">
                  View Programs
                  <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
                </Link>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">Certifications</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Get globally recognized tech certifications to boost your career prospects.
                </p>
                <Link href="/certifications" className="text-red-600 hover:text-red-700 font-medium flex items-center">
                  View Certifications
                  <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
                </Link>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">Careers</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Find the best tech job opportunities across Africa and advance your career.
                </p>
                <Link href="/careers" className="text-red-600 hover:text-red-700 font-medium flex items-center">
                  Browse Jobs
                  <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
                </Link>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">Contact</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Need help? Get in touch with our team and we'll be happy to assist you.
                </p>
                <Link href="/contact" className="text-red-600 hover:text-red-700 font-medium flex items-center">
                  Contact Us
                  <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Still can't find what you're looking for?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Try searching for it or contact our support team for assistance.
            </p>
            
            <div className="max-w-md mx-auto mb-6">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search courses, programs, or topics..."
                  className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-r-lg transition-colors">
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <Button href="/contact" variant="outline" className="flex items-center justify-center mx-auto">
              <Mail className="h-5 w-5 mr-2" />
              Contact Support
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
