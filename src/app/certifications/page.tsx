'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, BookOpen, Clock, Award, ChevronRight, Users, BarChart2 } from 'lucide-react';
import Button from '@/components/Button';
import SectionHeading from '@/components/SectionHeading';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

const certificationPrograms = [
  {
    id: 1,
    title: "Certified Cloud Professional",
    level: "Intermediate",
    duration: "3 months",
    format: "Online + Hands-on Labs",
    description: "Master cloud computing fundamentals and gain practical experience with AWS, Azure, and Google Cloud platforms.",
    category: "Cloud Computing",
    image: "/images/certifications/cloud-cert.jpg"
  },
  {
    id: 2,
    title: "Data Science Specialist",
    level: "Advanced",
    duration: "4 months",
    format: "Online + Capstone Project",
    description: "Develop expertise in machine learning, statistical analysis, and data visualization techniques.",
    category: "Data Science",
    image: "/images/certifications/data-science-cert.jpg"
  },
  {
    id: 3,
    title: "Cybersecurity Fundamentals",
    level: "Beginner",
    duration: "2 months",
    format: "Online + Virtual Labs",
    description: "Learn essential cybersecurity principles and gain hands-on experience with security tools and techniques.",
    category: "Cybersecurity",
    image: "/images/certifications/cyber-cert.jpg"
  }
];

const popularCategories = [
  { name: "Cloud Computing", count: 8 },
  { name: "Software Development", count: 12 },
  { name: "Data Science", count: 6 },
  { name: "Cybersecurity", count: 7 },
  { name: "DevOps", count: 5 }
];

const certificationBenefits = [
  {
    title: "Industry-Recognized Credentials",
    description: "Our certifications are valued by employers across Africa's tech industry",
    icon: <BadgeCheck className="h-6 w-6 text-red-600" />
  },
  {
    title: "Practical Skill Development",
    description: "Hands-on projects and labs ensure you gain real-world skills",
    icon: <BookOpen className="h-6 w-6 text-red-600" />
  },
  {
    title: "Career Advancement",
    description: "Certified professionals earn 25% more on average",
    icon: <BarChart2 className="h-6 w-6 text-red-600" />
  },
  {
    title: "Community Access",
    description: "Join our network of certified professionals",
    icon: <Users className="h-6 w-6 text-red-600" />
  }
];

export default function CertificationsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-gray-50 to-white pt-20 pb-24 px-4 sm:px-6 lg:pt-28 lg:pb-32 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <div className="absolute right-0 bottom-0 w-1/3 h-1/3 bg-red-50 rounded-tl-3xl opacity-70"></div>
            <div className="absolute left-0 top-0 w-1/4 h-1/4 bg-gray-100 rounded-br-3xl"></div>
          </div>
          
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center">
              <span className="inline-block px-4 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full mb-4">
                Validate Your Skills
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Professional</span>
                <span className="block text-red-600">Certifications</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                Earn industry-recognized credentials to advance your tech career in Africa.
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/certifications" variant="primary">
                  Browse Certifications
                </Button>
                <Button href="/certifications/guide" variant="outline">
                  How It Works
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Certification Benefits */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Why Get Certified"
              title="Benefits of Certification"
              description="How our certification programs can help your career"
              alignment="center"
            />
            
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {certificationBenefits.map((benefit, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-center">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="mt-2 text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certification Programs */}
        <section id="certification-programs" className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Programs"
              title="Certification Tracks"
              description="Choose from our industry-recognized certification programs"
              alignment="left"
            />
            
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {certificationPrograms.map((program) => (
                <article key={program.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="h-48 bg-gray-200 relative">
                    <Image
                      src={program.image}
                      alt={program.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white text-red-600 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <Award className="h-3 w-3 mr-1" />
                      {program.level}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {program.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      <Link href={`/certifications/${program.id}`} className="hover:text-red-600 transition-colors">
                        {program.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4">{program.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        {program.duration} program
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {program.format}
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button href={`/certifications/${program.id}`} variant="primary" className="w-full">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button href="/certifications/all" variant="outline">
                View All Certification Programs
              </Button>
            </div>
          </div>
        </section>

        {/* Certification Process */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:flex gap-12 items-center">
              <div className="lg:w-1/2 mb-12 lg:mb-0">
                <SectionHeading
                  eyebrow="Getting Certified"
                  title="How Our Certification Process Works"
                  description="Simple steps to earn your professional certification"
                  alignment="left"
                />
                
                <div className="mt-8 space-y-8">
                  <div className="flex">
                    <div className="flex-shrink-0 bg-red-100 text-red-600 h-10 w-10 rounded-full flex items-center justify-center mr-4">
                      1
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Choose Your Certification</h3>
                      <p className="mt-1 text-gray-600">
                        Select from our range of certification programs based on your career goals and skill level.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 bg-red-100 text-red-600 h-10 w-10 rounded-full flex items-center justify-center mr-4">
                      2
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Complete the Program</h3>
                      <p className="mt-1 text-gray-600">
                        Work through the curriculum, complete hands-on projects, and prepare for your certification exam.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 bg-red-100 text-red-600 h-10 w-10 rounded-full flex items-center justify-center mr-4">
                      3
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Pass the Certification Exam</h3>
                      <p className="mt-1 text-gray-600">
                        Demonstrate your skills by passing our rigorous certification assessment.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 bg-red-100 text-red-600 h-10 w-10 rounded-full flex items-center justify-center mr-4">
                      4
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Get Certified</h3>
                      <p className="mt-1 text-gray-600">
                        Receive your digital badge and certificate, and join our community of certified professionals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src="/images/certifications/cert-process.jpg"
                      alt="Certification process"
                      width={800}
                      height={450}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories & Sidebar */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:flex gap-12">
              {/* Main Content */}
              <div className="lg:w-2/3">
                <SectionHeading
                  eyebrow="Find Your Path"
                  title="Certification Categories"
                  description="Browse certifications by technology area"
                  alignment="left"
                />
                
                <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="grid gap-6 sm:grid-cols-2">
                    {popularCategories.map((category, index) => (
                      <Link 
                        key={index} 
                        href={`/certifications/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="group flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {category.count} certification programs
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:w-1/3 mt-12 lg:mt-0">
                {/* Certification Guide */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 text-red-600 mr-2" />
                    Certification Guide
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Download our free guide to choosing the right certification for your career goals.
                  </p>
                  <Button href="/certifications/guide" variant="primary" className="w-full">
                    Download Guide (PDF)
                  </Button>
                </div>
                
                {/* Certification Preparation */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 text-red-600 mr-2" />
                    Prepare for Certification
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/certifications/prep-courses" className="text-gray-700 hover:text-red-600 transition-colors flex items-center">
                        <ChevronRight className="h-4 w-4 text-red-600 mr-2" />
                        Prep Courses
                      </Link>
                    </li>
                    <li>
                      <Link href="/certifications/practice-exams" className="text-gray-700 hover:text-red-600 transition-colors flex items-center">
                        <ChevronRight className="h-4 w-4 text-red-600 mr-2" />
                        Practice Exams
                      </Link>
                    </li>
                    <li>
                      <Link href="/certifications/study-groups" className="text-gray-700 hover:text-red-600 transition-colors flex items-center">
                        <ChevronRight className="h-4 w-4 text-red-600 mr-2" />
                        Study Groups
                      </Link>
                    </li>
                  </ul>
                </div>
                
                {/* Certification Verification */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BadgeCheck className="h-5 w-5 text-red-600 mr-2" />
                    Verify Certification
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Verify the certification status of a TechGetAfrica credential holder.
                  </p>
                  <Button href="/certifications/verify" variant="outline" className="w-full">
                    Verify Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-red-600 rounded-2xl px-6 py-16 sm:p-16 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Get Certified?
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                Take the next step in your tech career with an industry-recognized certification.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/certifications/browse" variant="outline">
                  Browse All Certifications
                </Button>
                <Button href="/contact" variant="outline">
                  Speak to an Advisor
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}