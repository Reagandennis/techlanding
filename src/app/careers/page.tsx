'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Briefcase, MapPin, Clock, DollarSign, User, Search, ArrowRight, BookOpen, Users } from 'lucide-react';
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import Footer from '../componets/Footer';
import Navbar from '../componets/Navbar';

const featuredJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "AfriTech Solutions",
    location: "Remote (Africa)",
    type: "Full-time",
    salary: "$60,000 - $80,000",
    posted: "2 days ago",
    description: "We're looking for an experienced React developer to lead our frontend team building fintech solutions for African markets.",
    logo: "/images/companies/afritech.jpg"
  },
  {
    id: 2,
    title: "Cloud Engineer",
    company: "CloudAfrica",
    location: "Lagos, Nigeria",
    type: "Full-time",
    salary: "$50,000 - $70,000",
    posted: "1 week ago",
    description: "Join our cloud infrastructure team to design and implement scalable solutions for pan-African clients.",
    logo: "/images/companies/cloudafrica.jpg"
  },
  {
    id: 3,
    title: "UX Designer",
    company: "Digital Ventures",
    location: "Nairobi, Kenya",
    type: "Contract",
    salary: "$40,000 - $55,000",
    posted: "3 days ago",
    description: "Help us create intuitive user experiences for our growing portfolio of mobile applications.",
    logo: "/images/companies/digitalventures.jpg"
  }
];

const popularCategories = [
  { name: "Software Development", count: 42 },
  { name: "Cloud Computing", count: 28 },
  { name: "Data Science", count: 23 },
  { name: "UX/UI Design", count: 19 },
  { name: "DevOps", count: 15 }
];

const careerResources = [
  {
    title: "How to Prepare for Technical Interviews in Africa",
    type: "Guide",
    readTime: "10 min read"
  },
  {
    title: "Salary Negotiation Tips for African Tech Professionals",
    type: "Article",
    readTime: "8 min read"
  },
  {
    title: "Building a Strong Tech Portfolio Without Work Experience",
    type: "Tutorial",
    readTime: "12 min read"
  },
  {
    title: "Remote Work Best Practices for African Developers",
    type: "Guide",
    readTime: "15 min read"
  }
];

export default function CareersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-50">
      <Navbar />
      </header>

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
                Find Your Dream Tech Job
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Tech Careers in</span>
                <span className="block text-red-600">Africa</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                Discover the best tech opportunities across Africa and resources to advance your career.
              </p>
              
              <div className="mt-12 max-w-2xl mx-auto relative">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Search jobs by title, company, or keyword..."
                    className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-r-lg transition-colors">
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Jobs */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Featured Opportunities"
              title="Latest Job Postings"
              description="Browse our curated selection of top tech jobs across Africa"
              alignment="left"
            />
            
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job) => (
                <article key={job.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-white border border-gray-200 overflow-hidden mr-4">
                        <Image
                          src={job.logo}
                          alt={job.company}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                          <Link href={`/careers/${job.id}`} className="hover:text-red-600 transition-colors">
                            {job.title}
                          </Link>
                        </h2>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Briefcase className="h-4 w-4 mr-2" />
                        {job.type}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {job.salary}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        Posted {job.posted}
                      </div>
                    </div>
                    
                    <p className="mt-4 text-gray-600 text-sm">{job.description}</p>
                    
                    <div className="mt-6">
                      <Button href={`/careers/${job.id}`} variant="outline" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button href="/careers/jobs" variant="outline">
                View All Job Openings
              </Button>
            </div>
          </div>
        </section>

        {/* Career Content Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:flex gap-12">
              {/* Main Content */}
              <div className="lg:w-2/3">
                <SectionHeading
                  eyebrow="Career Growth"
                  title="Resources & Guides"
                  description="Essential materials to help you navigate your tech career in Africa"
                  alignment="left"
                />
                
                {/* Resource List */}
                <div className="mt-12 space-y-8">
                  {/* Resource 1 */}
                  <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                    <div className="md:flex">
                      <div className="md:w-1/3 mb-6 md:mb-0">
                        <div className="h-full bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src="/images/careers/interview-prep.jpg"
                            alt="Interview preparation"
                            width={400}
                            height={300}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                      <div className="md:w-2/3 md:pl-6">
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <span className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Guide
                          </span>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            15 min read
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                          <Link href="/careers/resources/interview-prep" className="hover:text-red-600 transition-colors">
                            The Complete Guide to Tech Interviews in Africa
                          </Link>
                        </h2>
                        <p className="text-gray-600 mb-4">
                          Learn how to prepare for technical interviews at top African tech companies, including coding challenges, system design questions, and cultural fit assessments.
                        </p>
                        <div className="flex items-center text-red-600 font-medium">
                          <Link href="/careers/resources/interview-prep" className="flex items-center">
                            Read Guide
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                  
                  {/* Resource 2 */}
                  <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                    <div className="md:flex">
                      <div className="md:w-1/3 mb-6 md:mb-0">
                        <div className="h-full bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src="/images/careers/salary-report.jpg"
                            alt="Salary report"
                            width={400}
                            height={300}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                      <div className="md:w-2/3 md:pl-6">
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Report
                          </span>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            20 min read
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                          <Link href="/careers/resources/salary-report" className="hover:text-red-600 transition-colors">
                            2023 African Tech Salary Report
                          </Link>
                        </h2>
                        <p className="text-gray-600 mb-4">
                          Comprehensive analysis of salary ranges across different tech roles in major African markets, including remote work compensation trends.
                        </p>
                        <div className="flex items-center text-red-600 font-medium">
                          <Link href="/careers/resources/salary-report" className="flex items-center">
                            View Report
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
                
                {/* Pagination */}
                <div className="mt-12 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
                      Previous
                    </button>
                    <button className="px-3 py-1 rounded bg-red-600 text-white">
                      1
                    </button>
                    <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                      2
                    </button>
                    <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                      3
                    </button>
                    <span className="px-2 text-gray-500">...</span>
                    <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                      5
                    </button>
                    <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
                      Next
                    </button>
                  </nav>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:w-1/3 mt-12 lg:mt-0">
                {/* Categories */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 text-red-600 mr-2" />
                    Job Categories
                  </h3>
                  <ul className="space-y-3">
                    {popularCategories.map((category, index) => (
                      <li key={index}>
                        <Link href={`/careers/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`} className="flex justify-between items-center text-gray-700 hover:text-red-600 transition-colors">
                          <span>{category.name}</span>
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {category.count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Career Resources */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 text-red-600 mr-2" />
                    Career Resources
                  </h3>
                  <ul className="space-y-4">
                    {careerResources.map((resource, index) => (
                      <li key={index}>
                        <Link href={`/careers/resources/${resource.title.toLowerCase().replace(/\s+/g, '-')}`} className="group">
                          <h4 className="text-gray-900 group-hover:text-red-600 transition-colors mb-1">
                            {resource.title}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mr-2">
                              {resource.type}
                            </span>
                            <Clock className="h-4 w-4 mr-1" />
                            {resource.readTime}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Job Alert */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 text-red-600 mr-2" />
                    Get Job Alerts
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Receive personalized job recommendations based on your skills and preferences.
                  </p>
                  <form className="space-y-3">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                    <Button variant="primary" className="w-full" href={''}>
                      Create Job Alert
                    </Button>
                  </form>
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
                Are You Hiring Tech Talent?
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                Connect with thousands of qualified African tech professionals looking for their next opportunity.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/employers" variant="outline">
                  Post a Job
                </Button>
                <Button href="/employers/contact" variant="outline">
                  Contact Our Team
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