'use client'

import React from 'react';
import Link from 'next/link';
import { Filter, Search, BookOpen, Clock, Signal } from 'lucide-react';
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import CourseCard from '../componets/CourseCard';
import Footer from '../componets/Footer';
import Navbar from '../componets/Navbar';

// Types from your CourseCard component
type CourseCardProps = {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  provider: string;
  imageSrc: string;
  imageAlt: string;
  badges: string[];
  href: string;
};

export default function CoursesPage() {
  // Extended course list including featured courses and more
  const allCourses: CourseCardProps[] = [
    {
      id: 'aws-cloud-practitioner',
      title: 'AWS Certified Cloud Practitioner',
      description: 'Master foundational AWS concepts and earn the industry-recognized AWS Cloud Practitioner certification.',
      duration: '6 weeks',
      level: 'Beginner',
      provider: 'AWS',
      imageSrc: '/images/courses/aws-cloud-practitioner.jpg',
      imageAlt: 'AWS Cloud Practitioner Certification',
      badges: ['High Demand', 'Entry Level'],
      href: '/courses/aws-cloud-practitioner'
    },
    {
      id: 'comptia-security-plus',
      title: 'CompTIA Security+',
      description: 'Gain essential cybersecurity skills with this globally recognized credential for security professionals.',
      duration: '8 weeks',
      level: 'Intermediate',
      provider: 'CompTIA',
      imageSrc: '/images/courses/comptia-security-plus.jpg',
      imageAlt: 'CompTIA Security+ Certification',
      badges: ['Top Rated', 'High Salary'],
      href: '/courses/comptia-security-plus'
    },
    {
      id: 'microsoft-azure-fundamentals',
      title: 'Microsoft Azure Fundamentals',
      description: 'Build cloud computing expertise with Microsoft Azure and prepare for the AZ-900 certification exam.',
      duration: '4 weeks',
      level: 'Beginner',
      provider: 'Microsoft',
      imageSrc: '/images/courses/azure-fundamentals.jpg',
      imageAlt: 'Microsoft Azure Fundamentals Certification',
      badges: ['Fast Track', 'Entry Level'],
      href: '/courses/azure-fundamentals'
    },
    // Additional courses
    {
      id: 'google-cloud-associate',
      title: 'Google Cloud Associate Engineer',
      description: 'Learn to deploy applications, monitor operations, and manage enterprise solutions on Google Cloud.',
      duration: '10 weeks',
      level: 'Intermediate',
      provider: 'Google',
      imageSrc: '/images/courses/google-cloud-associate.jpg',
      imageAlt: 'Google Cloud Associate Engineer Certification',
      badges: ['High Demand', 'Cloud Computing'],
      href: '/courses/google-cloud-associate'
    },
    {
      id: 'cisco-ccna',
      title: 'Cisco CCNA',
      description: 'Master networking fundamentals, IP services, security fundamentals, automation and programmability.',
      duration: '12 weeks',
      level: 'Intermediate',
      provider: 'Cisco',
      imageSrc: '/images/courses/cisco-ccna.jpg',
      imageAlt: 'Cisco CCNA Certification',
      badges: ['Networking', 'Essential'],
      href: '/courses/cisco-ccna'
    },
    {
      id: 'kubernetes-administrator',
      title: 'Certified Kubernetes Administrator',
      description: 'Learn to deploy and manage Kubernetes clusters in production environments.',
      duration: '8 weeks',
      level: 'Advanced',
      provider: 'CNCF',
      imageSrc: '/images/courses/cka.jpg',
      imageAlt: 'Certified Kubernetes Administrator',
      badges: ['Cloud Native', 'DevOps'],
      href: '/courses/kubernetes-administrator'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-50">
      <Navbar />
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Explore Our</span>
                <span className="block text-red-600">Certification Courses</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Browse through our comprehensive collection of globally recognized tech certifications designed for African professionals.
              </p>
            </div>

            {/* Search and Filter Bar */}
            <div className="mt-10 max-w-3xl mx-auto">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <input
                      type="search"
                      placeholder="Search courses..."
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <Button variant="outline" className="flex items-center gap-2" href={'added'}>
                  <Filter className="h-5 w-5" />
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {allCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-red-600 py-16">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
            <p className="mt-4 text-red-100">Begin your journey towards professional certification today.</p>
            <div className="mt-8">
              <Button href="/register" variant="secondary">
                Enroll Now
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}