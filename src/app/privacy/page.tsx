'use client'

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, User, Mail, Server } from 'lucide-react';
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import Footer from '../componets/Footer';

export default function PrivacyPolicyPage() {
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
            <Link href="/contact" className="text-gray-700 hover:text-red-600 transition-colors">Contact</Link>
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
                Your Data Security
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Privacy</span>
                <span className="block text-red-600">Policy</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                Learn how we collect, use, and protect your personal information.
              </p>
              
              <div className="mt-12">
                <p className="text-sm text-gray-500">
                  Last updated: June 15, 2023
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Policy Content */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="prose max-w-4xl mx-auto">
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Shield className="h-6 w-6 text-red-600 mr-3" />
                  Introduction
                </h2>
                <p className="text-gray-600 mb-4">
                  TechGetAfrica ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                </p>
                <p className="text-gray-600">
                  By accessing or using our service, you agree to the collection and use of information in accordance with this policy. If you disagree with any part of this policy, please do not use our services.
                </p>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <User className="h-6 w-6 text-red-600 mr-3" />
                  Information We Collect
                </h2>
                <p className="text-gray-600 mb-4">
                  We collect several types of information from and about users of our website, including:
                </p>
                <ul className="text-gray-600 list-disc pl-5 space-y-2 mb-4">
                  <li><strong>Personal Identification Information:</strong> Name, email address, phone number, etc.</li>
                  <li><strong>Demographic Information:</strong> Age, gender, country, preferences, and interests</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, operating system, etc.</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent, navigation paths</li>
                  <li><strong>Cookies and Tracking Data:</strong> Information collected through cookies and similar technologies</li>
                </ul>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Mail className="h-6 w-6 text-red-600 mr-3" />
                  How We Use Your Information
                </h2>
                <p className="text-gray-600 mb-4">
                  We use the information we collect in various ways, including to:
                </p>
                <ul className="text-gray-600 list-disc pl-5 space-y-2 mb-4">
                  <li>Provide, operate, and maintain our website and services</li>
                  <li>Improve, personalize, and expand our website and services</li>
                  <li>Understand and analyze how you use our website and services</li>
                  <li>Develop new products, services, features, and functionality</li>
                  <li>Communicate with you, either directly or through one of our partners</li>
                  <li>Send you emails and other marketing communications</li>
                  <li>Find and prevent fraud</li>
                </ul>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Server className="h-6 w-6 text-red-600 mr-3" />
                  Data Storage and Security
                </h2>
                <p className="text-gray-600 mb-4">
                  We implement appropriate technical and organizational measures to protect the security of your personal information. However, please remember that no method of transmission over the Internet or method of electronic storage is 100% secure.
                </p>
                <p className="text-gray-600">
                  Your personal information is stored on secure servers and protected through a combination of physical and logical access controls, encryption, firewalls, and other security technologies.
                </p>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Lock className="h-6 w-6 text-red-600 mr-3" />
                  Your Data Protection Rights
                </h2>
                <p className="text-gray-600 mb-4">
                  Depending on your location, you may have the following rights regarding your personal data:
                </p>
                <ul className="text-gray-600 list-disc pl-5 space-y-2 mb-4">
                  <li><strong>Right to Access:</strong> Request copies of your personal data</li>
                  <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong>Right to Restrict Processing:</strong> Request restriction of processing your data</li>
                  <li><strong>Right to Data Portability:</strong> Request transfer of your data to another organization</li>
                  <li><strong>Right to Object:</strong> Object to our processing of your personal data</li>
                </ul>
                <p className="text-gray-600">
                  To exercise any of these rights, please contact us using the information provided in the Contact section below.
                </p>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookies and Tracking Technologies</h2>
                <p className="text-gray-600 mb-4">
                  We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
                </p>
                <p className="text-gray-600">
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
                </p>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Services</h2>
                <p className="text-gray-600 mb-4">
                  We may employ third-party companies and individuals to facilitate our services, provide services on our behalf, perform service-related services, or assist us in analyzing how our service is used.
                </p>
                <p className="text-gray-600">
                  These third parties have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                </p>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Children's Privacy</h2>
                <p className="text-gray-600 mb-4">
                  Our services are not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
                </p>
                <p className="text-gray-600">
                  If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us. If we discover that we have collected personal information from a child under 13 without verification of parental consent, we will take steps to remove that information from our servers.
                </p>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to This Privacy Policy</h2>
                <p className="text-gray-600 mb-4">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
                <p className="text-gray-600">
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ul className="text-gray-600 list-disc pl-5 space-y-2">
                  <li>By email: privacy@techgetafrica.com</li>
                  <li>By visiting this page on our website: <Link href="/contact" className="text-red-600 hover:underline">Contact Us</Link></li>
                  <li>By phone: +234 800 123 4567</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-red-600 rounded-2xl px-6 py-16 sm:p-16 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Have Questions About Your Data?
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                Our privacy team is ready to address any concerns you may have about your personal information.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/contact" variant="outline">
                  Contact Privacy Team
                </Button>
                <Button href="/data-request" variant="outline">
                  Submit Data Request
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