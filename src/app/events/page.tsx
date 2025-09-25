'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Clock, User, ChevronRight, BookOpen, Users, Mic } from 'lucide-react';
import Button from '@/components/Button';
import SectionHeading from '@/components/SectionHeading';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

const upcomingEvents = [
  {
    id: 1,
    title: "African Tech Summit 2025",
    date: "June 15-17, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "Lagos, Nigeria",
    description: "The premier gathering of Africa's tech ecosystem - featuring keynotes, workshops, and networking with industry leaders.",
    category: "Conference",
    speakers: 24,
    image: "/images/techgetafrica.png"
  },
  {
    id: 2,
    title: "Women in Tech Hackathon",
    date: "July 8, 2025",
    time: "10:00 AM - 8:00 PM",
    location: "Nairobi, Kenya (Virtual option available)",
    description: "A day-long hackathon focused on creating solutions for African challenges, exclusively for women developers.",
    category: "Hackathon",
    speakers: 8,
    image: "/images/cloud.png"
  },
  {
    id: 3,
    title: "Cloud Computing Workshop",
    date: "August 3, 2025",
    time: "2:00 PM - 5:00 PM",
    location: "Online",
    description: "Hands-on workshop teaching AWS and Azure cloud deployment strategies for African startups.",
    category: "Workshop",
    speakers: 3,
    image: "/images/cloud.png"
  }
];

const pastEvents = [
  {
    title: "Fintech Innovation Forum",
    date: "May 12, 2025",
    attendees: "320 participants"
  },
  {
    title: "AI for Social Good Challenge",
    date: "April 5, 2025",
    attendees: "150 teams"
  },
  {
    title: "Developer Meetup: Lagos",
    date: "March 28, 2025",
    attendees: "85 developers"
  },
  {
    title: "Tech Career Fair 2025",
    date: "February 15, 2025",
    attendees: "42 companies"
  }
];

const eventCategories = [
  { name: "Conferences", count: 18 },
  { name: "Hackathons", count: 12 },
  { name: "Workshops", count: 25 },
  { name: "Meetups", count: 32 },
  { name: "Webinars", count: 15 }
];

export default function EventsPage() {
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
                Connect & Learn
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Tech Events in</span>
                <span className="block text-red-600">Africa</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                Discover upcoming conferences, workshops, and networking events across Africa's tech ecosystem.
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="#upcoming-events" variant="primary">
                  View Upcoming Events
                </Button>
                <Button href="/events/submit" variant="outline">
                  Submit Your Event
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Events */}
        <section id="upcoming-events" className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="What's Happening"
              title="Upcoming Events"
              description="Join these exciting tech events across Africa"
              alignment="left"
            />
            
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <article key={event.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="h-48 bg-gray-200 relative">
                    <Image
                      src="/images/techgetafrica.png"
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {event.category}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="inline-flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {event.speakers} speakers
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      <Link href={`/events/${event.id}`} className="hover:text-red-600 transition-colors">
                        {event.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {event.date}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button href={`/events/${event.id}`} variant="primary" className="w-full">
                        Register Now
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button href="/events/calendar" variant="outline">
                View Full Event Calendar
              </Button>
            </div>
          </div>
        </section>

        {/* Events Content Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:flex gap-12">
              {/* Main Content */}
              <div className="lg:w-2/3">
                <SectionHeading
                  eyebrow="Featured Event"
                  title="African Tech Summit 2025"
                  description="The largest gathering of Africa's tech ecosystem"
                  alignment="left"
                />
                
                <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden mb-6">
                    <Image
                      src="/images/events/summit-hero.jpg"
                      alt="African Tech Summit"
                      width={800}
                      height={450}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900">About the Event</h3>
                    <p className="text-gray-600">
                      The African Tech Summit brings together over 2,000 tech leaders, entrepreneurs, investors, and policymakers from across the continent for three days of learning, networking, and collaboration.
                    </p>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mt-6">Event Highlights</h3>
                    <ul className="text-gray-600 list-disc pl-5 space-y-2">
                      <li>Keynote speeches from Africa's top tech CEOs</li>
                      <li>Interactive workshops on emerging technologies</li>
                      <li>Startup pitch competitions with $100,000 in prizes</li>
                      <li>Networking sessions with investors and recruiters</li>
                      <li>Exhibition hall featuring latest tech innovations</li>
                    </ul>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mt-6">Who Should Attend</h3>
                    <p className="text-gray-600">
                      This summit is ideal for tech professionals, startup founders, investors, corporate leaders, policymakers, and anyone passionate about Africa's digital transformation.
                    </p>
                    
                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Date & Time</h4>
                        <p className="text-gray-600">June 15-17, 2025</p>
                        <p className="text-gray-600">9:00 AM - 6:00 PM daily</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                        <p className="text-gray-600">Landmark Centre</p>
                        <p className="text-gray-600">Victoria Island, Lagos, Nigeria</p>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <Button href="/events/african-tech-summit/register" variant="primary">
                        Register Now
                      </Button>
                      <Button href="/events/african-tech-summit/schedule" variant="outline">
                        View Full Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:w-1/3 mt-12 lg:mt-0">
                {/* Event Categories */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 text-red-600 mr-2" />
                    Event Categories
                  </h3>
                  <ul className="space-y-3">
                    {eventCategories.map((category, index) => (
                      <li key={index}>
                        <Link href={`/events/category/${category.name.toLowerCase()}`} className="flex justify-between items-center text-gray-700 hover:text-red-600 transition-colors">
                          <span>{category.name}</span>
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {category.count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Past Events */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 text-red-600 mr-2" />
                    Past Events
                  </h3>
                  <ul className="space-y-4">
                    {pastEvents.map((event, index) => (
                      <li key={index}>
                        <Link href={`/events/archive/${event.title.toLowerCase().replace(/\s+/g, '-')}`} className="group">
                          <h4 className="text-gray-900 group-hover:text-red-600 transition-colors mb-1">
                            {event.title}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {event.date}
                            <span className="mx-2">•</span>
                            <Users className="h-4 w-4 mr-1" />
                            {event.attendees}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Link href="/events/archive" className="text-sm text-red-600 font-medium flex items-center">
                      View all past events
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
                
                {/* Call for Speakers */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Mic className="h-5 w-5 text-red-600 mr-2" />
                    Call for Speakers
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Interested in speaking at one of our events? Share your expertise with Africa's tech community.
                  </p>
                  <Button href="/events/speakers" variant="primary" className="w-full">
                    Apply to Speak
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
                Host Your Event With Us
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                Reach Africa's tech community by hosting your event on TechGetAfrica.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/events/host" variant="outline">
                  Learn About Hosting
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