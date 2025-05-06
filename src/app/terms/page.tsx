'use client'

import React from 'react';
import Link from 'next/link';
import { FileText, Shield, CreditCard, User, Lock } from 'lucide-react';
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import Footer from '../componets/Footer';
import Navbar from '../componets/Navbar';

export default function TermsPage() {
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
                Legal Information
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Terms &</span>
                <span className="block text-red-600">Conditions</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                Please read these terms carefully before using our services.
              </p>
              
              <div className="mt-12">
                <p className="text-sm text-gray-500">
                  Last updated: June 15, 2023
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="prose max-w-4xl mx-auto">
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <FileText className="h-6 w-6 text-red-600 mr-3" />
                  Introduction
                </h2>
                <p className="text-gray-600 mb-4">
                  These Terms and Conditions ("Terms") govern your use of TechGetAfrica's website and services ("Services"). By accessing or using our Services, you agree to be bound by these Terms.
                </p>
                <p className="text-gray-600">
                  If you disagree with any part of these Terms, you may not access the Services. We reserve the right to modify these Terms at any time.
                </p>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <User className="h-6 w-6 text-red-600 mr-3" />
                  User Accounts
                </h2>
                <p className="text-gray-600 mb-4">
                  When you create an account with us, you must provide accurate and complete information. You are responsible for:
                </p>
                <ul className="text-gray-600 list-disc pl-5 space-y-2 mb-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Immediately notifying us of any unauthorized use of your account</li>
                </ul>
                <p className="text-gray-600">
                  We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion.
                </p>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="h-6 w-6 text-red-600 mr-3" />
                  Payments and Refunds
                </h2>
                <p className="text-gray-600 mb-4">
                  All fees for our Services are stated in Kenyan Shillings (KES) and are non-refundable except as required by law or as specifically stated otherwise.
                </p>
                <ul className="text-gray-600 list-disc pl-5 space-y-2 mb-4">
                  <li>Payment must be made in full before accessing paid Services</li>
                  <li>We use third-party payment processors and do not store your payment details</li>
                  <li>Refund requests must be made within 7 days of purchase</li>
                </ul>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Shield className="h-6 w-6 text-red-600 mr-3" />
                  Intellectual Property
                </h2>
                <p className="text-gray-600 mb-4">
                  The Services and their original content, features, and functionality are owned by TechGetAfrica and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <p className="text-gray-600">
                  You may not modify, reproduce, distribute, or create derivative works based on our content without express written permission.
                </p>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Lock className="h-6 w-6 text-red-600 mr-3" />
                  User Conduct
                </h2>
                <p className="text-gray-600 mb-4">
                  You agree not to:
                </p>
                <ul className="text-gray-600 list-disc pl-5 space-y-2 mb-4">
                  <li>Use the Services for any illegal purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Services</li>
                  <li>Share your account credentials with others</li>
                  <li>Upload or transmit viruses or harmful code</li>
                </ul>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Termination</h2>
                <p className="text-gray-600 mb-4">
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
                </p>
                <p className="text-gray-600">
                  Upon termination, your right to use the Services will immediately cease. All provisions of these Terms which should survive termination shall survive.
                </p>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
                <p className="text-gray-600 mb-4">
                  In no event shall TechGetAfrica, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages resulting from:
                </p>
                <ul className="text-gray-600 list-disc pl-5 space-y-2 mb-4">
                  <li>Your use or inability to use the Services</li>
                  <li>Any unauthorized access to or use of our servers</li>
                  <li>Any interruption or cessation of transmission to or from our Services</li>
                  <li>Any bugs, viruses, or similar that may be transmitted through our Services</li>
                </ul>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Governing Law</h2>
                <p className="text-gray-600 mb-4">
                  These Terms shall be governed and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
                </p>
                <p className="text-gray-600">
                  Any disputes arising under these Terms will be resolved in the courts of Kenya.
                </p>
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to Terms</h2>
                <p className="text-gray-600 mb-4">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect.
                </p>
                <p className="text-gray-600">
                  By continuing to access or use our Services after those revisions become effective, you agree to be bound by the revised terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms, please contact us:
                </p>
                <ul className="text-gray-600 list-disc pl-5 space-y-2">
                  <li>By email: legal@techgetafrica.com</li>
                  <li>By visiting this page on our website: <Link href="/contact" className="text-red-600 hover:underline">Contact Us</Link></li>
                  <li>By mail: P.O. Box 12345, Nairobi, Kenya</li>
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
                Need Help Understanding Our Terms?
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                Our legal team is available to clarify any questions you may have.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/contact" variant="outline">
                  Contact Legal Team
                </Button>
                <Button href="/privacy" variant="outline">
                  View Privacy Policy
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