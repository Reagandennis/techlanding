'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HelpCircle, Mail, MessageSquare, Phone, Clock, ChevronRight, BookOpen, Users, FileText, Search } from 'lucide-react';
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import Footer from '../componets/Footer';

const faqs = [
  {
    id: 1,
    question: "How do I reset my password?",
    answer: "You can reset your password by clicking on 'Forgot Password' on the login page. We'll send a reset link to your registered email address.",
    category: "Account"
  },
  {
    id: 2,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, mobile money (M-Pesa, MTN Mobile Money, etc.), and bank transfers for payments across Africa.",
    category: "Payments"
  },
  {
    id: 3,
    question: "How can I update my profile information?",
    answer: "You can update your profile by logging into your account and navigating to the 'My Profile' section. All changes are saved automatically.",
    category: "Account"
  },
  {
    id: 4,
    question: "Is there a mobile app available?",
    answer: "Yes! Our mobile app is available for both iOS and Android devices. You can download it from the App Store or Google Play Store.",
    category: "General"
  }
];

const popularArticles = [
  {
    title: "Getting Started with TechGetAfrica",
    category: "Onboarding",
    readTime: "5 min read"
  },
  {
    title: "Troubleshooting Payment Issues",
    category: "Payments",
    readTime: "7 min read"
  },
  {
    title: "Optimizing Your Profile for Job Searches",
    category: "Career",
    readTime: "10 min read"
  },
  {
    title: "Understanding Our Certification Process",
    category: "Accreditation",
    readTime: "8 min read"
  }
];

const supportChannels = [
  {
    name: "Help Center",
    description: "Browse our comprehensive knowledge base",
    icon: <HelpCircle className="h-8 w-8 text-red-600" />,
    action: "Search articles",
    link: "/help-center"
  },
  {
    name: "Email Support",
    description: "Get a response within 24 hours",
    icon: <Mail className="h-8 w-8 text-red-600" />,
    action: "Send us an email",
    link: "mailto:support@techgetafrica.com"
  },
  {
    name: "Live Chat",
    description: "Available Monday-Friday, 9am-5pm WAT",
    icon: <MessageSquare className="h-8 w-8 text-red-600" />,
    action: "Start chat",
    link: "/live-chat"
  },
  {
    name: "Phone Support",
    description: "Call our regional support numbers",
    icon: <Phone className="h-8 w-8 text-red-600" />,
    action: "View numbers",
    link: "/contact"
  }
];

export default function HelpPage() {
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
            <Link href="/careers" className="text-gray-700 hover:text-red-600 transition-colors">Careers</Link>
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
                We're here to help
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Help &</span>
                <span className="block text-red-600">Support</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                Find answers to your questions or contact our support team for assistance.
              </p>
              
              <div className="mt-12 max-w-2xl mx-auto relative">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Search help articles..."
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

        {/* Support Channels */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Get Help"
              title="Support Channels"
              description="Choose how you'd like to contact us"
              alignment="center"
            />
            
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {supportChannels.map((channel, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-center">
                  <div className="flex justify-center">
                    {channel.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{channel.name}</h3>
                  <p className="mt-2 text-gray-600">{channel.description}</p>
                  <div className="mt-6">
                    <Link href={channel.link} className="inline-flex items-center text-red-600 font-medium">
                      {channel.action}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:flex gap-12">
              {/* Main Content */}
              <div className="lg:w-2/3">
                <SectionHeading
                  eyebrow="Common Questions"
                  title="Frequently Asked Questions"
                  description="Quick answers to our most frequently asked questions"
                  alignment="left"
                />
                
                <div className="mt-12 space-y-6">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-red-100 p-2 rounded-lg mr-4">
                          <HelpCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                          <div className="mt-2 text-gray-600">
                            <p>{faq.answer}</p>
                          </div>
                          <div className="mt-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {faq.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 text-center">
                  <Button href="/faqs" variant="outline">
                    View All FAQs
                  </Button>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:w-1/3 mt-12 lg:mt-0">
                {/* Popular Articles */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 text-red-600 mr-2" />
                    Popular Articles
                  </h3>
                  <ul className="space-y-4">
                    {popularArticles.map((article, index) => (
                      <li key={index}>
                        <Link href={`/help-center/${article.title.toLowerCase().replace(/\s+/g, '-')}`} className="group">
                          <h4 className="text-gray-900 group-hover:text-red-600 transition-colors mb-1">
                            {article.title}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mr-2">
                              {article.category}
                            </span>
                            <Clock className="h-4 w-4 mr-1" />
                            {article.readTime}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Community Support */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 text-red-600 mr-2" />
                    Community Support
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Join our community forum to get help from other TechGetAfrica members and experts.
                  </p>
                  <Button href="/community/forum" variant="primary" className="w-full">
                    Visit Community Forum
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 rounded-2xl p-8 sm:p-12 lg:p-16">
              <div className="lg:flex gap-12 items-center">
                <div className="lg:w-1/2 mb-12 lg:mb-0">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Still need help?
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Can't find what you're looking for? Send us a message and our support team will get back to you as soon as possible.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-red-100 p-2 rounded-lg mr-4">
                        <Mail className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Email us</h3>
                        <p className="mt-1 text-gray-600">
                          <Link href="mailto:support@techgetafrica.com" className="text-red-600 hover:underline">
                            support@techgetafrica.com
                          </Link>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-red-100 p-2 rounded-lg mr-4">
                        <Clock className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Support hours</h3>
                        <p className="mt-1 text-gray-600">
                          Monday - Friday: 8:00 AM - 5:00 PM WAT<br />
                          Saturday: 9:00 AM - 1:00 PM WAT
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:w-1/2">
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      ></textarea>
                    </div>
                    
                    <div>
                      <Button variant="primary" className="w-full" href={''}>
                        Send Message
                      </Button>
                    </div>
                  </form>
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