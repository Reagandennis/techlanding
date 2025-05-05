'use client'

import React from 'react';
import Link from 'next/link';
import { BookOpen, Video, FileText, Newspaper, Download, Target } from 'lucide-react';
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import Footer from '../componets/Footer';

const resources = [
  {
    category: "Learning Materials",
    items: [
      {
        title: "Technical Documentation",
        icon: <FileText className="h-8 w-8 text-red-600" />,
        description: "Comprehensive guides and documentation for various technologies.",
        links: [
          "Programming Guides",
          "API Documentation",
          "Best Practices",
          "Code Examples",
            "Frameworks and Libraries",
            "Version Control Systems",
            "Development Tools",
            "Deployment Strategies",
            "Testing and Debugging",
            "Performance Optimization",
            "Security Practices",
            "Continuous Integration/Deployment",
            "Software Architecture",
            "Design Patterns",
            "Development Methodologies",
            "Agile Practices",
            "Code Reviews",
            "Collaboration Tools",
            "any many more ...",
        ]
      },
      {
        title: "Video Tutorials",
        icon: <Video className="h-8 w-8 text-red-600" />,
        description: "In-depth video tutorials covering various tech topics.",
        links: [
          "Beginner Tutorials",
          "Advanced Concepts",
          "Project Walkthroughs",
          "Live Coding Sessions",
            "Web Development",
            "Mobile Development",
            "Data Science",
            "Machine Learning",
            "Cloud Computing",
            "DevOps",
            "Cybersecurity",
            "Game Development",
            "UI/UX Design",
            "Artificial Intelligence",
            "Blockchain",
            "Internet of Things (IoT)",
            "Software Engineering",
            "Database Management",
            "and many more ...",
        ]
      }
    ]
  },
  {
    category: "Career Resources",
    items: [
      {
        title: "Industry Insights",
        icon: <Newspaper className="h-8 w-8 text-red-600" />,
        description: "Latest trends and insights from the tech industry.",
        links: [
          "Market Reports",
          "Industry Analysis",
          "Career Trends",
          "Salary Guides",
          "Job Market Insights",
          "Emerging Technologies",
          "Tech Company Profiles",
          "Tech Ecosystem Analysis",
          "Tech Conferences",
          "Networking Opportunities",
          "Tech Community Events",
          "Tech Startups",
          "Tech Innovations",
          "Tech Thought Leaders",
        ]
      },
      {
        title: "Downloadable Resources",
        icon: <Download className="h-8 w-8 text-red-600" />,
        description: "Templates and tools to help advance your career.",
        links: [
          "Resume Templates",
          "Interview Guides",
          "Career Roadmaps",
          "Portfolio Examples",
          "Project Ideas",
          "Skill Assessment Tools",
          "Networking Templates",
          "Job Application Templates",
          "Salary Negotiation Guides",
          "Time Management Tools",
          "Productivity Tools",
          "Goal Setting Templates",
          "Learning Path Templates",
          "Skill Development Plans",
          "Career Development Plans",
          "Personal Branding Templates",
          "Social Media Profiles",
        ]
      }
    ]
  }
];

export default function ResourcesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-red-600">
              TechGet<span className="text-black">Africa</span>
            </Link>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link href="/accreditation" className="text-gray-700 hover:text-red-600 transition-colors">Accreditation</Link>
            <Link href="/programs" className="text-gray-700 hover:text-red-600 transition-colors">Programs</Link>
            <Link href="/partners" className="text-gray-700 hover:text-red-600 transition-colors">Partners</Link>
            <Link href="/resources" className="text-gray-700 hover:text-red-600 transition-colors">Resources</Link>
            <Link href="/communities" className="text-gray-700 hover:text-red-600 transition-colors">Community</Link>
          </div>

          {/* Auth buttons */}
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
        <section className="bg-gradient-to-b from-gray-50 to-white pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Tech Learning</span>
                <span className="block text-red-600">Resources Hub</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Access comprehensive learning materials, industry insights, and career resources to support your tech journey.
              </p>
            </div>
          </div>
        </section>

        {/* Resources Grid Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {resources.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-16 last:mb-0">
                <SectionHeading
                  eyebrow="Learning Resources"
                  title={category.category}
                  description="Essential materials for your tech career"
                />

                <div className="mt-12 grid gap-8 md:grid-cols-2">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-gray-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-4">
                        {item.icon}
                        <h3 className="ml-3 text-xl font-semibold text-gray-900">{item.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      <ul className="space-y-2">
                        {item.links.map((link, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-500">
                            <Target className="h-4 w-4 text-red-500 mr-2" />
                            {link}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-red-600 py-16">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-bold text-white">Start Learning Today</h2>
            <p className="mt-4 text-red-100">Access our comprehensive library of tech resources.</p>
            <div className="mt-8">
              <Button href="/register" variant="secondary">
                Access Resources
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}