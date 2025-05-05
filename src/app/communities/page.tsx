'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, MessageSquare, Calendar, Globe, Target, Share2, BookOpen, Code, Briefcase, Award, MapPin, Video, Coffee, CheckCircle } from 'lucide-react';
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import Footer from '../componets/Footer';

const communityFeatures = [
  {
    title: "Tech Meetups & Events",
    icon: <Users className="h-8 w-8 text-red-600" />,
    description: "Join our vibrant network of tech professionals through regular in-person and virtual gatherings.",
    activities: [
      "Monthly networking events in 12 African cities",
      "Tech talks featuring industry leaders",
      "Quarterly hackathons with prizes",
      "Community-driven projects"
    ],
    stats: [
      { value: "50+", label: "Events monthly" },
      { value: "5,000+", label: "Participants" }
    ]
  },
  {
    title: "Discussion Forums",
    icon: <MessageSquare className="h-8 w-8 text-red-600" />,
    description: "Engage in meaningful conversations about technology, career growth, and industry trends.",
    activities: [
      "Technical Q&A with experts",
      "Career advice from senior professionals",
      "Project collaboration opportunities",
      "Mentorship matching program"
    ],
    stats: [
      { value: "10,000+", label: "Monthly discussions" },
      { value: "200+", label: "Topics covered" }
    ]
  },
  {
    title: "Learning Circles",
    icon: <BookOpen className="h-8 w-8 text-red-600" />,
    description: "Join study groups and peer learning sessions for various tech disciplines.",
    activities: [
      "Certification study groups",
      "Code review sessions",
      "Book clubs for tech literature",
      "Workshop follow-up discussions"
    ],
    stats: [
      { value: "85%", label: "Exam pass rate" },
      { value: "40+", label: "Active circles" }
    ]
  },
  {
    title: "Global Network",
    icon: <Globe className="h-8 w-8 text-red-600" />,
    description: "Connect with tech professionals from around the world through our international partnerships.",
    activities: [
      "Cross-border mentorship program",
      "Global tech challenges",
      "Cultural exchange initiatives",
      "International job opportunities"
    ],
    stats: [
      { value: "32", label: "Countries represented" },
      { value: "150+", label: "Global partners" }
    ]
  }
];

const upcomingEvents = [
  {
    title: "Cloud Computing Workshop",
    date: "June 15, 2025",
    location: "Nairobi & Online",
    description: "Hands-on session with AWS solutions architects",
    type: "Workshop"
  },
  {
    title: "Women in Tech Summit",
    date: "June 22, 2025",
    location: "Lagos & Online",
    description: "Celebrating female tech leaders in Africa",
    type: "Conference"
  },
  {
    title: "Monthly Networking Mixer",
    date: "July 5, 2025",
    location: "Johannesburg",
    description: "Casual networking for tech professionals",
    type: "Networking"
  },
  {
    title: "AI Hackathon",
    date: "July 15-16, 2025",
    location: "Virtual",
    description: "48-hour challenge to build AI solutions",
    type: "Hackathon"
  }
];

const successStories = [
  {
    name: "Amina K.",
    role: "Software Developer",
    quote: "Through the community mentorship program, I gained the confidence to contribute to open source and landed my dream job.",
    image: "/images/community/amina.jpg"
  },
  {
    name: "David O.",
    role: "Cloud Engineer",
    quote: "The study group helped me prepare for my AWS certification - we held each other accountable and shared resources.",
    image: "/images/community/david.jpg"
  },
  {
    name: "Ngozi E.",
    role: "UX Designer",
    quote: "I found my co-founder at a TechGetAfrica networking event. We've now built a successful design agency together.",
    image: "/images/community/ngozi.jpg"
  }
];

export default function CommunityPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-red-600">
              TechGet<span className="text-black">Africa</span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-6">
            <Link href="/accreditation" className="text-gray-700 hover:text-red-600 transition-colors">Accreditation</Link>
            <Link href="/programs" className="text-gray-700 hover:text-red-600 transition-colors">Programs</Link>
            <Link href="/partners" className="text-gray-700 hover:text-red-600 transition-colors">Partners</Link>
            <Link href="/resources" className="text-gray-700 hover:text-red-600 transition-colors">Resources</Link>
            <Link href="/community" className="text-gray-700 hover:text-red-600 transition-colors">Community</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="text-gray-700 hover:text-red-600 transition-colors">Log In</Link>
            <Link href="/register" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">
              Get Started
            </Link>
          </div>
        </nav>
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
                Connect & Grow
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Africa's Most Vibrant</span>
                <span className="block text-red-600">Tech Community</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                Join 50,000+ tech professionals learning, networking, and advancing their careers together.
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/register" variant="primary">
                  Join Community
                </Button>
                <Button href="/events" variant="outline">
                  View Upcoming Events
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Community Impact Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Impact"
              title="By The Numbers"
              description="The reach and impact of our tech community across Africa"
              alignment="center"
            />
            
            <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="text-center bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-red-600 mb-2">50,000+</div>
                <div className="text-sm text-gray-500">Community Members</div>
              </div>
              <div className="text-center bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-red-600 mb-2">12</div>
                <div className="text-sm text-gray-500">African Countries</div>
              </div>
              <div className="text-center bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-red-600 mb-2">500+</div>
                <div className="text-sm text-gray-500">Events Yearly</div>
              </div>
              <div className="text-center bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-red-600 mb-2">76%</div>
                <div className="text-sm text-gray-500">Career Advancement</div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Community Features"
              title="Ways To Engage"
              description="Discover all the opportunities available through our community"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-2">
              {communityFeatures.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                        <p className="text-red-600">{feature.description}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Activities Include:</h4>
                      <ul className="space-y-2">
                        {feature.activities.map((activity, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-500">
                            <Target className="flex-shrink-0 h-4 w-4 text-red-500 mr-2 mt-0.5" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        {feature.stats.map((stat, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-red-600">{stat.value}</div>
                            <div className="text-xs text-gray-500">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="What's Happening"
              title="Upcoming Events"
              description="Join our upcoming community gatherings and learning opportunities"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-600 rounded-full">
                      {event.type}
                    </span>
                    <div className="text-sm text-gray-500 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.location}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.date}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                  
                  <Button href="/events" variant="outline" className="w-full">
                    Learn More
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <Button href="/events" variant="primary">
                View All Events
              </Button>
            </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Community Stories"
              title="Member Successes"
              description="Hear from members who've transformed their careers through our community"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {successStories.map((story, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center mb-6">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden">
                      <Image 
                        src={story.image}
                        alt={`${story.name} profile`}
                        width={64}
                        height={64}
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{story.name}</h3>
                      <p className="text-sm text-red-600">{story.role}</p>
                    </div>
                  </div>
                  
                  <blockquote className="italic text-gray-600 mb-6">
                    "{story.quote}"
                  </blockquote>
                  
                  <Button href="/success-stories" variant="outline">
                    Read Full Story
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Guidelines Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:flex items-center gap-12">
              <div className="lg:w-1/2 mb-10 lg:mb-0">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full mb-4">
                  Our Values
                </span>
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">Community Guidelines</h2>
                
                <div className="prose prose-red max-w-none">
                  <p className="text-gray-600 text-lg mb-6">
                    Our community is built on mutual respect, inclusivity, and a shared passion for technology. We welcome professionals from all backgrounds who adhere to these principles.
                  </p>
                  
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>Be respectful and inclusive in all interactions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>Share knowledge generously and credit sources</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>Maintain professional conduct at all times</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>Respect privacy and confidentiality</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>Help foster a positive learning environment</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <div className="rounded-xl overflow-hidden shadow-lg relative">
                  <Image 
                    src="/images/com.png" 
                    alt="TechGetAfrica community meetup"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-6 text-white">
                      <p className="font-medium">Monthly community meetup in Nairobi</p>
                    </div>
                  </div>
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
                Ready to Join Our Community?
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                Connect with thousands of tech professionals across Africa and accelerate your career.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/register" variant="outline">
                  Sign Up Now
                </Button>
                <Button href="/community-tour" variant="outline">
                  Take a Community Tour
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