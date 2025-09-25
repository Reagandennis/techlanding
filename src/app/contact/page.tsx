'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, MessageSquare, ChevronRight } from 'lucide-react';
import Button from '@/components/Button';
import SectionHeading from '@/components/SectionHeading';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

const contactMethods = [
  {
    name: "Email Support",
    description: "Get a response within 24 hours",
    icon: <Mail className="h-8 w-8 text-red-600" />,
    details: "support@techgetafrica.com",
    action: "Send us an email",
    link: "mailto:support@techgetafrica.com"
  },
  {
    name: "Phone Support",
    description: "Call our regional offices",
    icon: <Phone className="h-8 w-8 text-red-600" />,
    details: "Lagos: +254 796004050\nNairobi: +254 796004050\nCape Town: +254 796004050",
    action: "View all numbers",
    link: "/contact/numbers"
  },
  {
    name: "Live Chat",
    description: "Available Monday-Friday, 9am-5pm WAT",
    icon: <MessageSquare className="h-8 w-8 text-red-600" />,
    details: "Start a chat session through our website or mobile app",
    action: "Start chatting now",
    link: "/live-chat"
  }
];

const regionalOffices = [
  {
    city: "Lagos",
    country: "Nigeria",
    address: "Vitual Office",
    phone: "+254 796004050",
    email: "support@techgetafrica.com"
  },
  {
    city: "Nairobi",
    country: "Kenya",
    address: "Lower Kabete, 1st Floor, Nairobi",
    phone: "+254 796004050",
    email: "support@techgetafrica.com"
  },
  {
    city: "Cape Town",
    country: "South Africa",
    address: "Vitual Office",
    phone: "+254 796004050",
    email: "support@techgetafrica.com"
  }
];

export default function ContactPage() {
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
                We're here to help
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Contact</span>
                <span className="block text-red-600">TechGetAfrica</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                Get in touch with our team through any of these channels.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="How to reach us"
              title="Contact Methods"
              description="Choose your preferred way to get in touch"
              alignment="center"
            />
            
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {contactMethods.map((method, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex justify-center">
                    {method.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">{method.name}</h3>
                  <p className="mt-2 text-gray-600 text-center">{method.description}</p>
                  <div className="mt-4 bg-white p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-line">{method.details}</p>
                  </div>
                  <div className="mt-6 text-center">
                    <Link href={method.link} className="inline-flex items-center text-red-600 font-medium">
                      {method.action}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:flex gap-12 items-center">
              <div className="lg:w-1/2 mb-12 lg:mb-0">
                <SectionHeading
                  eyebrow="Send us a message"
                  title="Contact Form"
                  description="Fill out this form and we'll get back to you as soon as possible"
                  alignment="left"
                />
                
                <div className="mt-8 space-y-4">
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
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-red-100 p-2 rounded-lg mr-4">
                      <Mail className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">General inquiries</h3>
                      <p className="mt-1 text-gray-600">
                        <Link href="mailto:suppport@techgetafrica.com" className="text-red-600 hover:underline">
                          support@techgetafrica.com
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <form className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
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
                        Email Address *
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
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="media">Media Inquiry</option>
                        <option value="feedback">Feedback/Suggestions</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
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
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Regional Offices */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our locations"
              title="Regional Offices"
              description="Visit us at any of our offices across Africa"
              alignment="center"
            />
            
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {regionalOffices.map((office, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 text-center">
                    {office.city}, {office.country}
                  </h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{office.address}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{office.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{office.email}</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button href={`/contact/${office.city.toLowerCase()}`} variant="outline" className="w-full">
                      View Office Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-red-600 rounded-2xl px-6 py-16 sm:p-16 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Need Immediate Assistance?
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                Our support team is ready to help you with any questions or issues.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/live-chat" variant="outline">
                  Start Live Chat
                </Button>
                <Button href="/contact/numbers" variant="outline">
                  Call Support Now
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