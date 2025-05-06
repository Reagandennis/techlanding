'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Laptop, Users, Book, Clock, Trophy, Target, Shield, Award, CheckCircle, Briefcase, Code, Database, Cloud, Paintbrush, Server } from 'lucide-react';
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import Footer from '../componets/Footer';
import Navbar from '../componets/Navbar';

const programCategories = [
  {
    title: "By Learning Style",
    description: "Choose the format that fits your schedule and learning preferences",
    programs: [
      {
        title: "Immersive Bootcamps",
        icon: <Laptop className="h-8 w-8 text-red-600" />,
        description: "Full-time, intensive programs that transform beginners into job-ready professionals in 12-16 weeks.",
        features: [
          "Daily live instruction",
          "Hands-on projects",
          "Career coaching",
          "Job placement support"
        ],
        duration: "12-16 weeks",
        level: "Beginner to Advanced"
      },
      {
        title: "Flexible Courses",
        icon: <Book className="h-8 w-8 text-red-600" />,
        description: "Self-paced learning with structured milestones and instructor support.",
        features: [
          "Learn at your own pace",
          "Weekly mentor sessions",
          "Real-world projects",
          "Certificate upon completion"
        ],
        duration: "3-6 months",
        level: "All Levels"
      },
      {
        title: "Workshops & Events",
        icon: <Clock className="h-8 w-8 text-red-600" />,
        description: "Short, focused sessions on trending topics and emerging technologies.",
        features: [
          "Expert-led sessions",
          "Hands-on activities",
          "Networking opportunities",
          "Latest industry insights"
        ],
        duration: "1 day - 2 weeks",
        level: "Beginner to Intermediate"
      }
    ]
  },
  {
    title: "By Career Path",
    description: "Specialized programs designed for specific tech career trajectories",
    programs: [
      {
        title: "Software Engineering",
        icon: <Code className="h-8 w-8 text-red-600" />,
        description: "Master full-stack development with modern frameworks and best practices.",
        features: [
          "Frontend (React, Angular)",
          "Backend (Node.js, Python)",
          "Database integration",
          "DevOps fundamentals"
        ],
        duration: "16 weeks",
        level: "Beginner to Intermediate"
      },
      {
        title: "Data Science",
        icon: <Database className="h-8 w-8 text-red-600" />,
        description: "Learn to extract insights from data using Python, SQL, and machine learning.",
        features: [
          "Data analysis with Python",
          "Machine learning basics",
          "Data visualization",
          "Big data tools"
        ],
        duration: "14 weeks",
        level: "Intermediate"
      },
      {
        title: "Cloud Engineering",
        icon: <Cloud className="h-8 w-8 text-red-600" />,
        description: "Become proficient in cloud platforms like AWS, Azure, and Google Cloud.",
        features: [
          "Cloud architecture",
          "Containerization",
          "Serverless computing",
          "Security best practices"
        ],
        duration: "12 weeks",
        level: "Intermediate"
      },
      {
        title: "UX/UI Design",
        icon: <Paintbrush className="h-8 w-8 text-red-600" />,
        description: "Design intuitive digital experiences with user-centered methodologies.",
        features: [
          "User research",
          "Wireframing & prototyping",
          "UI design principles",
          "Design systems"
        ],
        duration: "10 weeks",
        level: "Beginner"
      },
      {
        title: "DevOps",
        icon: <Server className="h-8 w-8 text-red-600" />,
        description: "Bridge development and operations with automation and CI/CD pipelines.",
        features: [
          "Infrastructure as code",
          "CI/CD implementation",
          "Monitoring & logging",
          "Cloud deployment"
        ],
        duration: "14 weeks",
        level: "Advanced"
      }
    ]
  }
];

const certificationPrograms = [
  {
    provider: "AWS",
    logo: "/images/aws.svg",
    programs: [
      "AWS Certified Cloud Practitioner",
      "AWS Certified Solutions Architect",
      "AWS Certified Developer",
      "AWS Certified Advanced Networking",
      "AWS Certified Machine Learning",
      "AWS Certified Security - Specialty"
    ],
    benefits: [
      "Official AWS curriculum",
      "Hands-on labs",
      "Exam vouchers",
      "Job placement support",
      "Certified AWS user"
    ]
  },
  {
    provider: "Microsoft",
    logo: "/images/microsoft.png",
    programs: [
      "Microsoft Certified: Azure Fundamentals",
      "Microsoft Certified: Azure Administrator",
      "Microsoft Certified: Azure Developer",
      "Microsoft Certified: Azure AI Engineer Associate:",
      "Microsoft Certified: Azure Data Scientist Associate",
      "Microsoft Certified: Azure Solutions Architect Expert"

    ],
    benefits: [
      "Azure sandbox environment",
      "Practice tests",
      "Microsoft learning paths",
      "Technical mentorship",
      "Hands-on labs"
    ]
  },
  {
    provider: "Google",
    logo: "/images/google.svg",
    programs: [
      "Google Cloud Digital Leader",
      "Google Associate Cloud Engineer",
      "Google Professional Data Engineer",
      "Google Professional Cloud Architect",
      "Google Professional Cloud Developer",
      "Google Professional Cloud Security Engineer"
    ],
    benefits: [
      "Google Cloud credits",
      "Qwiklabs access",
      "Exam preparation",
      "Cloud project portfolio",
      "Networking opportunities"


    ]
  }
];

const successStories = [
  {
    name: "Amina K.",
    role: "Junior Software Developer",
    program: "Full-Stack Development Bootcamp",
    quote: "The bootcamp gave me the skills and confidence to land my first tech job within 2 weeks of graduating.",
    image: "/images/success/amina.jpg"
  },
  {
    name: "David M.",
    role: "Cloud Engineer",
    program: "AWS Certification Program",
    quote: "The structured learning path and hands-on labs prepared me perfectly for the certification exam.",
    image: "/images/success/david.jpg"
  },
  {
    name: "Ngozi O.",
    role: "UX Designer",
    program: "UI/UX Design Course",
    quote: "The portfolio projects I completed during the program became my strongest selling point to employers.",
    image: "/images/success/ngozi.jpg"
  }
];

export default function ProgramsPage() {
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
                Tech Education
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Launch Your Tech Career</span>
                <span className="block text-red-600">With Our Programs</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                Industry-aligned programs designed to equip you with in-demand skills and accelerate your career growth.
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/programs" variant="primary">
                  Explore Programs
                </Button>
                <Button href="/contact" variant="outline">
                  Speak to an Advisor
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Program Categories Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {programCategories.map((category, index) => (
              <div key={index} className="mb-20 last:mb-0">
                <SectionHeading
                  eyebrow="Program Categories"
                  title={category.title}
                  description={category.description}
                />

                <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {category.programs.map((program, programIndex) => (
                    <div key={programIndex} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all">
                      <div className="p-6">
                        <div className="flex items-center mb-6">
                          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                            {program.icon}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-xl font-semibold text-gray-900">{program.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{program.duration}</span>
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{program.level}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-6">{program.description}</p>
                        
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
                        
                        <Button href={`/programs/${program.title.toLowerCase().replace(/\s+/g, '-')}`} variant="outline" className="w-full">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certification Programs Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Industry Certifications"
              title="Globally Recognized Credentials"
              description="Prepare for and earn certifications from leading technology providers"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {certificationPrograms.map((certification, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="p-6">
                    <div className="flex items-center justify-center h-16 mb-6">
                      <Image 
                        src={certification.logo}
                        alt={`${certification.provider} logo`}
                        width={120}
                        height={64}
                        className="object-contain h-full"
                      />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-center text-gray-900 mb-6">{certification.provider} Certifications</h3>
                    
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">Available Programs:</h4>
                      <ul className="space-y-2">
                        {certification.programs.map((program, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-500">
                            <Award className="flex-shrink-0 h-4 w-4 text-red-500 mr-2 mt-0.5" />
                            {program}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Program Benefits:</h4>
                      <ul className="space-y-2">
                        {certification.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-500">
                            <Shield className="flex-shrink-0 h-4 w-4 text-red-500 mr-2 mt-0.5" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Success Stories"
              title="Our Graduates' Journeys"
              description="Hear from alumni who transformed their careers through our programs"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {successStories.map((story, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:shadow-md transition-all">
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
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Completed:</p>
                    <p className="text-gray-700">{story.program}</p>
                  </div>
                  
                  <blockquote className="italic text-gray-600 mb-6">
                    "{story.quote}"
                  </blockquote>
                  
                  <Button href="/success-stories" variant="outline">
                    Read More Stories
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Experience Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Approach"
              title="The TechGetAfrica Learning Experience"
              description="What sets our programs apart from traditional education"
              alignment="center"
            />
            
            <div className="mt-16 grid md:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="text-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
                  <Briefcase className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry-Aligned Curriculum</h3>
                <p className="text-gray-600 text-sm">Content developed with input from hiring managers and tech leaders</p>
              </div>
              
              {/* Feature 2 */}
              <div className="text-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Instruction</h3>
                <p className="text-gray-600 text-sm">Learn from experienced professionals currently working in the field</p>
              </div>
              
              {/* Feature 3 */}
              <div className="text-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
                  <Target className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Project-Based Learning</h3>
                <p className="text-gray-600 text-sm">Build a portfolio of real-world projects that demonstrate your skills</p>
              </div>
              
              {/* Feature 4 */}
              <div className="text-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Support</h3>
                <p className="text-gray-600 text-sm">Resume reviews, mock interviews, and job placement assistance</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-red-600 rounded-2xl px-6 py-16 sm:p-16 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Transform Your Career?
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                Join thousands of African tech professionals who've accelerated their careers through our programs.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/programs" variant="outline">
                  Browse All Programs
                </Button>
                <Button href="/contact" variant="outline">
                  Get Personalized Advice
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