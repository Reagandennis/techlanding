'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, MessageSquare, BookOpen, Code, Trophy, Calendar, Globe, Award, ArrowRight } from 'lucide-react';

// Import Components
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import Navbar from '../componets/Navbar';
import Footer from '../componets/Footer';

interface CommunityFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
}

interface Event {
  title: string;
  date: string;
  type: 'workshop' | 'hackathon' | 'networking';
  description: string;
}

export default function CommunityTour() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const communityFeatures: CommunityFeature[] = [
    {
      title: 'Learning Circles',
      description: 'Join study groups and collaborate with peers',
      icon: <Users className="h-6 w-6" />,
      benefits: [
        'Peer-to-peer learning',
        'Group projects',
        'Knowledge sharing',
        'Study accountability'
      ]
    },
    {
      title: 'Discussion Forums',
      description: 'Engage in meaningful tech discussions',
      icon: <MessageSquare className="h-6 w-6" />,
      benefits: [
        'Technical Q&A',
        'Industry insights',
        'Career advice',
        'Community support'
      ]
    },
    {
      title: 'Resource Library',
      description: 'Access curated learning materials',
      icon: <BookOpen className="h-6 w-6" />,
      benefits: [
        'Study guides',
        'Practice exercises',
        'Video tutorials',
        'Code samples'
      ]
    },
    {
      title: 'Code Challenges',
      description: 'Participate in coding competitions',
      icon: <Code className="h-6 w-6" />,
      benefits: [
        'Weekly challenges',
        'Skill assessment',
        'Peer review',
        'Recognition'
      ]
    }
  ];

  const upcomingEvents: Event[] = [
    {
      title: 'Cloud Computing Workshop',
      date: 'June 15, 2024',
      type: 'workshop',
      description: 'Learn AWS and Azure fundamentals with hands-on practice'
    },
    {
      title: 'Tech Hackathon 2024',
      date: 'July 1-3, 2024',
      type: 'hackathon',
      description: 'Build innovative solutions and win exciting prizes'
    },
    {
      title: 'Industry Networking Mixer',
      date: 'June 20, 2024',
      type: 'networking',
      description: 'Connect with tech professionals and potential employers'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <Navbar />
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-white pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gray-50 rounded-l-3xl"></div>
            <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-red-50 rounded-tl-3xl"></div>
          </div>

          <div className="relative container mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Community Tour"
              title="Join Our Thriving Tech Community"
              description="Connect with fellow learners, share knowledge, and grow together in our supportive tech community."
              alignment="center"
            />

            {/* Navigation Tabs */}
            <div className="mt-12 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`${
                    activeTab === 'overview'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`${
                    activeTab === 'features'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Features
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`${
                    activeTab === 'events'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Events
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-8">
              {activeTab === 'overview' && (
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Why Join Our Community?
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <Trophy className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-900 font-medium">Skill Development</p>
                          <p className="text-gray-500">Learn from peers and industry experts</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <Globe className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-900 font-medium">Global Network</p>
                          <p className="text-gray-500">Connect with tech professionals worldwide</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0">
                          <Award className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-900 font-medium">Career Growth</p>
                          <p className="text-gray-500">Access job opportunities and mentorship</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Community Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-red-600">10,000+</p>
                        <p className="text-gray-500">Active Members</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-red-600">500+</p>
                        <p className="text-gray-500">Events Hosted</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-red-600">50+</p>
                        <p className="text-gray-500">Countries</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-red-600">95%</p>
                        <p className="text-gray-500">Success Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="grid gap-8 md:grid-cols-2">
                  {communityFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-lg p-8 border border-gray-100"
                    >
                      <div className="flex items-start">
                        <div className="bg-red-100 rounded-lg p-3">
                          {feature.icon}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {feature.title}
                          </h3>
                          <p className="text-gray-500 mt-1">
                            {feature.description}
                          </p>
                          <ul className="mt-4 space-y-2">
                            {feature.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-center text-sm text-gray-600">
                                <div className="h-1.5 w-1.5 bg-red-600 rounded-full mr-2"></div>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'events' && (
                <div className="space-y-8">
                  <div className="grid gap-8 md:grid-cols-3">
                    {upcomingEvents.map((event, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-lg p-6 border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            event.type === 'workshop'
                              ? 'bg-blue-100 text-blue-800'
                              : event.type === 'hackathon'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </span>
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {event.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          {event.date}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <Button
                      href="/events"
                      variant="primary"
                    >
                      View All Events
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center">
              <Button
                href="/register"
                variant="primary"
                className="text-lg px-8 py-3"
              >
                Join Our Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Community Success Stories
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Hear from our community members about their journey and achievements
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 mb-4">
                  "The community support and resources helped me land my dream job in cloud computing."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Cloud Engineer</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 mb-4">
                  "The hackathons and workshops provided practical experience that was invaluable."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Michael Chen</p>
                    <p className="text-sm text-gray-500">Software Developer</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 mb-4">
                  "The mentorship program helped me transition into tech successfully."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Emma Davis</p>
                    <p className="text-sm text-gray-500">Data Scientist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 