'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Rocket, Users, Briefcase, Award, Clock, CheckCircle, Zap, Globe, Code, Car } from 'lucide-react';
import Button from '../../componets/Button';
import SectionHeading from '../../componets/SectionHeading';
import Footer from '../../componets/Footer';
import Navbar from '@/app/componets/Navbar';

const programTracks = [
  {
    title: "Tech Startup Accelerator",
    icon: <Rocket className="h-8 w-8 text-red-600" />,
    description: "12-week intensive program for early-stage tech startups",
    features: [
      "Seed funding opportunities",
      "Mentorship from industry leaders",
      "Product development support",
      "Investor pitch training"
    ],
    duration: "12 weeks",
    eligibility: "Pre-seed to Seed stage startups"
  },
  {
    title: "Career Accelerator",
    icon: <Briefcase className="h-8 w-8 text-red-600" />,
    description: "Fast-track your tech career with specialized training",
    features: [
      "Personalized career roadmap",
      "Technical skill intensives",
      "Interview preparation",
      "Job placement support"
    ],
    duration: "8-16 weeks",
    eligibility: "Early to mid-career professionals"
  },
  {
    title: "Leadership Accelerator",
    icon: <Users className="h-8 w-8 text-red-600" />,
    description: "For tech professionals transitioning to leadership roles",
    features: [
      "Management training",
      "Technical leadership skills",
      "Team building workshops",
      "Executive coaching"
    ],
    duration: "6 months",
    eligibility: "Senior developers & tech managers"
  }
];

const programBenefits = [
  {
    title: "Industry Connections",
    icon: <Globe className="h-8 w-8 text-red-600" />,
    description: "Access to our network of 500+ tech companies and investors"
  },
  {
    title: "Hands-on Learning",
    icon: <Code className="h-8 w-8 text-red-600" />,
    description: "Practical, project-based curriculum with real-world applications"
  },
  {
    title: "Career Growth",
    icon: <Car className="h-8 w-8 text-red-600" />,
    description: "90% of participants advance their careers within 6 months"
  },
  {
    title: "Lifetime Access",
    icon: <Award className="h-8 w-8 text-red-600" />,
    description: "Continued access to resources and community after graduation"
  }
];

const successStories = [
  {
    name: "Sarah K.",
    role: "Founder, Fintech Startup",
    quote: "The accelerator gave us the structure and mentorship we needed to refine our product and secure our first round of funding.",
    image: "/images/accelerator/sarah.jpg"
  },
  {
    name: "David M.",
    role: "Senior Software Engineer",
    quote: "The career accelerator helped me transition from mid-level developer to tech lead in just 4 months.",
    image: "/images/accelerator/david.jpg"
  },
  {
    name: "Amina B.",
    role: "Product Manager",
    quote: "The leadership program gave me the confidence and skills to effectively manage my engineering team.",
    image: "/images/accelerator/amina.jpg"
  }
];

const programTimeline = [
  {
    phase: "Application",
    duration: "2 weeks",
    activities: [
      "Online application",
      "Initial screening",
      "Interview process"
    ]
  },
  {
    phase: "Onboarding",
    duration: "1 week",
    activities: [
      "Program orientation",
      "Skill assessments",
      "Goal setting"
    ]
  },
  {
    phase: "Core Program",
    duration: "8-12 weeks",
    activities: [
      "Weekly workshops",
      "Mentor sessions",
      "Project development"
    ]
  },
  {
    phase: "Demo & Graduation",
    duration: "2 weeks",
    activities: [
      "Final presentations",
      "Investor/recruiter day",
      "Alumni onboarding"
    ]
  }
];

export default function AcceleratorPage() {
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
                Intensive Growth Programs
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">TechGetAfrica</span>
                <span className="block text-red-600">Accelerator Programs</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                Fast-track your tech career or startup with our intensive, mentor-driven accelerator programs.
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/apply" variant="primary">
                  Apply Now
                </Button>
                <Button href="/programs" variant="outline">
                  Compare Programs
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Program Tracks Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Programs"
              title="Accelerator Tracks"
              description="Choose the program that aligns with your growth goals"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {programTracks.map((program, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4 mx-auto">
                    {program.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-center text-gray-900 mb-3">{program.title}</h3>
                  <p className="text-gray-600 text-center mb-6">{program.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Program Features:</h4>
                    <ul className="space-y-2">
                      {program.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-500">
                          <CheckCircle className="flex-shrink-0 h-4 w-4 text-red-500 mr-2 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{program.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Eligibility:</span>
                      <span className="font-medium text-right">{program.eligibility}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Why Join?"
              title="Program Benefits"
              description="What you'll gain from our accelerator experience"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {programBenefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4 mx-auto">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-center">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Program Timeline */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Process"
              title="Program Timeline"
              description="The structured journey through our accelerator programs"
              alignment="center"
            />
            
            <div className="mt-16 relative">
              {/* Timeline line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-200 transform -translate-x-1/2" aria-hidden="true"></div>
              
              <div className="grid md:grid-cols-4 gap-8">
                {programTimeline.map((phase, index) => (
                  <div key={index} className="relative text-center bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 md:top-1/2 md:-left-4 md:-translate-y-1/2 md:translate-x-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-600 text-white font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{phase.phase}</h3>
                    <div className="text-sm text-red-600 mb-4">{phase.duration}</div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {phase.activities.map((activity, idx) => (
                        <li key={idx}>{activity}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Success Stories"
              title="Accelerator Alumni"
              description="Hear from graduates who transformed their careers and businesses"
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
                  
                  <Button href="/success-stories" variant="outline" >
                    Read Full Story
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mentors Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Learn From"
              title="Industry Experts"
              description="Our accelerator mentors include successful founders, executives, and technical leaders"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {/* Mentor 1 */}
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200 group">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <Image 
                    src="/images/mentors/jane.jpg"
                    alt="Jane D. profile"
                    width={400}
                    height={300}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">Jane D.</h3>
                  <p className="text-red-600 text-sm mb-3">Founder, Fintech Unicorn</p>
                  <p className="text-gray-500 text-sm">Specializes in product-market fit and fundraising for early-stage startups</p>
                </div>
              </div>
              
              {/* Mentor 2 */}
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200 group">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <Image 
                    src="/images/mentors/michael.jpg"
                    alt="Michael K. profile"
                    width={400}
                    height={300}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">Michael K.</h3>
                  <p className="text-red-600 text-sm mb-3">CTO, Tech Giant</p>
                  <p className="text-gray-500 text-sm">Focuses on technical leadership and scaling engineering teams</p>
                </div>
              </div>
              
              {/* Mentor 3 */}
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200 group">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <Image 
                    src="/images/mentors/amina.jpg"
                    alt="Amina B. profile"
                    width={400}
                    height={300}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">Amina B.</h3>
                  <p className="text-red-600 text-sm mb-3">VP Engineering</p>
                  <p className="text-gray-500 text-sm">Expert in career transitions and leadership development</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Button href="/mentors" variant="outline">
                Meet All Mentors
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-red-600 rounded-2xl px-6 py-16 sm:p-16 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Accelerate Your Growth?
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                Applications for our next cohort close soon. Don't miss your chance to transform your career or startup.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/apply" variant="outline">
                  Apply Now
                </Button>
                <Button href="/info-session" variant="outline">
                  Join Info Session
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