'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, Video, ChevronRight, BookOpen, Mic, Headphones, Users } from 'lucide-react';
import Button from '@/components/Button';
import SectionHeading from '@/components/SectionHeading';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

const upcomingWebinars = [
  {
    id: 1,
    title: "The Future of AI in African Businesses",
    date: "June 22, 2023",
    time: "2:00 PM WAT (GMT+1)",
    duration: "90 minutes",
    speaker: "Dr. Adebayo Ojo, AI Researcher",
    description: "Learn how African enterprises are implementing AI solutions to solve local challenges and drive innovation.",
    category: "Artificial Intelligence",
    image: "/images/webinars/ai-business.jpg"
  },
  {
    id: 2,
    title: "Cloud Migration Strategies for Startups",
    date: "June 29, 2023",
    time: "11:00 AM EAT (GMT+3)",
    duration: "60 minutes",
    speaker: "Nadia Kamau, Cloud Architect",
    description: "Practical guidance for African startups looking to migrate to cloud infrastructure efficiently.",
    category: "Cloud Computing",
    image: "/images/webinars/cloud-migration.jpg"
  },
  {
    id: 3,
    title: "Building Inclusive Tech Teams",
    date: "July 6, 2023",
    time: "3:00 PM GMT",
    duration: "75 minutes",
    speaker: "Tendai Moyo, Diversity & Inclusion Lead",
    description: "Strategies for creating more diverse and welcoming tech workplaces in Africa.",
    category: "HR & Leadership",
    image: "/images/webinars/inclusive-teams.jpg"
  }
];

const pastWebinars = [
  {
    title: "Fintech Regulations Across Africa",
    date: "May 18, 2023",
    attendees: "420 participants",
    recording: true
  },
  {
    title: "Remote Work Best Practices",
    date: "April 27, 2023",
    attendees: "380 participants",
    recording: true
  },
  {
    title: "Cybersecurity for Small Businesses",
    date: "March 15, 2023",
    attendees: "290 participants",
    recording: true
  },
  {
    title: "UX Design for African Markets",
    date: "February 8, 2023",
    attendees: "350 participants",
    recording: true
  }
];

const webinarCategories = [
  { name: "Technology Trends", count: 15 },
  { name: "Career Development", count: 12 },
  { name: "Startup Growth", count: 9 },
  { name: "Leadership", count: 7 },
  { name: "Technical Skills", count: 18 }
];

export default function WebinarsPage() {
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
                Live & On-Demand
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Tech Webinars for</span>
                <span className="block text-red-600">African Professionals</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                Learn from industry experts without leaving your home or office.
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="#upcoming-webinars" variant="primary">
                  View Upcoming Webinars
                </Button>
                <Button href="/webinars/archive" variant="outline">
                  Watch Past Webinars
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Webinars */}
        <section id="upcoming-webinars" className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Live Learning"
              title="Upcoming Webinars"
              description="Register for these interactive online sessions"
              alignment="left"
            />
            
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {upcomingWebinars.map((webinar) => (
                <article key={webinar.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="h-48 bg-gray-200 relative">
                    <Image
                      src={webinar.image}
                      alt={webinar.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <Video className="h-4 w-4 mr-1" />
                        Live Webinar
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {webinar.category}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      <Link href={`/webinars/${webinar.id}`} className="hover:text-red-600 transition-colors">
                        {webinar.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4">{webinar.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {webinar.date}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        {webinar.time} • {webinar.duration}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2" />
                        {webinar.speaker}
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button href={`/webinars/${webinar.id}/register`} variant="primary" className="w-full">
                        Register Now
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button href="/webinars/schedule" variant="outline">
                View Full Webinar Schedule
              </Button>
            </div>
          </div>
        </section>

        {/* Webinar Content Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:flex gap-12">
              {/* Main Content */}
              <div className="lg:w-2/3">
                <SectionHeading
                  eyebrow="Featured Webinar"
                  title="The Future of AI in African Businesses"
                  description="How artificial intelligence is transforming enterprises across the continent"
                  alignment="left"
                />
                
                <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden mb-6">
                    <Image
                      src="/images/webinars/ai-business-hero.jpg"
                      alt="AI in African Businesses"
                      width={800}
                      height={450}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <div className="bg-white text-red-600 px-4 py-2 rounded-full font-medium flex items-center">
                        <Video className="h-5 w-5 mr-2" />
                        June 22, 2023 • 2:00 PM WAT
                      </div>
                    </div>
                  </div>
                  
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900">Webinar Details</h3>
                    <p className="text-gray-600">
                      This 90-minute live webinar will explore practical applications of artificial intelligence in African business contexts, featuring real-world case studies and implementation strategies.
                    </p>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mt-6">What You'll Learn</h3>
                    <ul className="text-gray-600 list-disc pl-5 space-y-2">
                      <li>Current AI adoption trends in African enterprises</li>
                      <li>Overcoming infrastructure challenges for AI deployment</li>
                      <li>Cost-effective AI solutions for SMEs</li>
                      <li>Ethical considerations for AI in African contexts</li>
                      <li>Future outlook for AI-powered businesses</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mt-6">About the Speaker</h3>
                    <div className="flex items-start mt-4">
                      <div className="flex-shrink-0 mr-4">
                        <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
                          <Image
                            src="/images/speakers/dr-adebayo-ojo.jpg"
                            alt="Dr. Adebayo Ojo"
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Dr. Adebayo Ojo</h4>
                        <p className="text-gray-600">AI Researcher & Consultant</p>
                        <p className="text-gray-600 text-sm mt-2">
                          Dr. Ojo has led AI implementation projects for major corporations across 5 African countries and is a frequent speaker on emerging technology trends.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <Button href="/webinars/ai-business/register" variant="primary">
                        Register Now
                      </Button>
                      <Button href="/webinars/ai-business/outline" variant="outline">
                        View Full Outline
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:w-1/3 mt-12 lg:mt-0">
                {/* Webinar Categories */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 text-red-600 mr-2" />
                    Webinar Topics
                  </h3>
                  <ul className="space-y-3">
                    {webinarCategories.map((category, index) => (
                      <li key={index}>
                        <Link href={`/webinars/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`} className="flex justify-between items-center text-gray-700 hover:text-red-600 transition-colors">
                          <span>{category.name}</span>
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {category.count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Past Webinars */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Headphones className="h-5 w-5 text-red-600 mr-2" />
                    Past Webinars
                  </h3>
                  <ul className="space-y-4">
                    {pastWebinars.map((webinar, index) => (
                      <li key={index}>
                        <Link href={`/webinars/archive/${webinar.title.toLowerCase().replace(/\s+/g, '-')}`} className="group">
                          <h4 className="text-gray-900 group-hover:text-red-600 transition-colors mb-1">
                            {webinar.title}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {webinar.date}
                            <span className="mx-2">•</span>
                            <Users className="h-4 w-4 mr-1" />
                            {webinar.attendees}
                          </div>
                          {webinar.recording && (
                            <div className="mt-1 inline-flex items-center text-xs text-red-600">
                              <Video className="h-3 w-3 mr-1" />
                              Recording available
                            </div>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Link href="/webinars/archive" className="text-sm text-red-600 font-medium flex items-center">
                      View all past webinars
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
                
                {/* Webinar Benefits */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Video className="h-5 w-5 text-red-600 mr-2" />
                    Why Attend Our Webinars?
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-red-600 mr-2 mt-0.5">•</div>
                      <span>Learn from top African tech experts</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-red-600 mr-2 mt-0.5">•</div>
                      <span>Get your questions answered live</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-red-600 mr-2 mt-0.5">•</div>
                      <span>Access recordings if you can't attend live</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-red-600 mr-2 mt-0.5">•</div>
                      <span>Network with other participants</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-red-600 mr-2 mt-0.5">•</div>
                      <span>Receive certificates of participation</span>
                    </li>
                  </ul>
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
                Want to Host a Webinar?
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                Share your expertise with Africa's tech community through our webinar platform.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/webinars/host" variant="outline">
                  Become a Speaker
                </Button>
                <Button href="/contact" variant="outline">
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