'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { Award, ArrowRight } from 'lucide-react';

// Import Components from new structure
import { Navbar } from '../../shared/components/layout';
import { Footer } from '../../shared/components/layout';
import { Button } from '../../shared/components/ui';
import { SectionHeading, PartnerLogo } from '../../shared/components/common';
import { BusinessVerticalCards } from '../../shared/components/homepage';

export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex flex-col min-h-screen font-sans bg-white">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <Navbar />
        </header>
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  // Partner logos data
  const partners = [
    { name: "AWS", logoSrc: "/images/aws.svg", href: "/partners/aws" },
    { name: "Cisco", logoSrc: "/images/cisco.png", href: "/partners/cisco" },
    { name: "CompTIA", logoSrc: "/images/Comptia.svg", href: "/partners/comptia" },
    { name: "Microsoft", logoSrc: "/images/microsoft.png", href: "/partners/microsoft" },
    { name: "Google", logoSrc: "/images/google.svg", href: "/partners/google" },
    { name: "ISC2", logoSrc: "/images/ics2.png", href: "/partners/isc2" },
  ];

  // Stats data
  const stats = [
    { label: "Certified Graduates", value: "186+" },
    { label: "Course Completion Rate", value: "89%" },
    { label: "Employment Rate", value: "76%" },
    { label: "African Countries Reached", value: "5" }
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      {/* Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <Navbar />
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section
          className="relative bg-white pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8 overflow-hidden"
          aria-labelledby="hero-heading"
        >
          {/* Background design element */}
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gray-50 rounded-l-3xl"></div>
            <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-red-50 rounded-tl-3xl"></div>
          </div>

          <div className="relative container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <span className="inline-block px-4 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full mb-4">
                Building Africa's Tech Future
              </span>
              <h1 id="hero-heading" className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Unlock Your Tech Future</span>{' '}
                <span className="block text-red-600 xl:inline">with World-Class Services</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl lg:mx-0">
                From education and certifications to recruitment, consulting, and development - TechGetAfrica is your comprehensive partner for technology success.
              </p>

              {/* Stats highlight */}
              <div className="mt-8 grid grid-cols-2 gap-4 text-left">
                <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-red-600">94%</p>
                  <p className="text-sm text-gray-500">Higher earning potential</p>
                </div>
                <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-red-600">5</p>
                  <p className="text-sm text-gray-500">African countries served</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-3">
                <Button href="/certifications" variant="primary">
                  Explore Services
                </Button>
                <Button href="/about" variant="secondary">
                  Learn More
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="mt-12 lg:mt-0 relative">
              <div className="rounded-lg shadow-xl overflow-hidden aspect-video">
                <Image
                  src="/images/anorld.jpeg"
                  alt="TechGetAfrica - Empowering African tech professionals"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>

              {/* Floating achievement badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
                <div className="rounded-full bg-red-100 p-2">
                  <Award className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Trusted Partner</p>
                  <p className="text-sm text-gray-500">4 specialized services</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Business Verticals Section */}
        <BusinessVerticalCards />

        {/* Partners Section */}
        <section
          className="bg-gray-50 py-12 sm:py-16"
          aria-labelledby="partners-heading"
        >
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2
              id="partners-heading"
              className="text-center text-sm font-semibold uppercase text-gray-500 tracking-wider mb-8"
            >
              Trusted by Industry Leaders
            </h2>

            <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
              {partners.map((partner) => (
                <Link
                  key={partner.name}
                  href={partner.href}
                  className="transition-transform hover:scale-105"
                >
                  <PartnerLogo
                    src={partner.logoSrc}
                    fallbackSrc={`https://placehold.co/150x60/cccccc/cccccc?text=${partner.name}`}
                    alt={`${partner.name} Logo`}
                  />
                </Link>
              ))}
            </div>

            <p className="mt-8 text-center text-gray-500 max-w-2xl mx-auto">
              Our partnerships with global technology leaders ensure you receive industry-recognized training and certifications.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-16 sm:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Impact"
              title="Transforming Careers Across Africa"
              description="Join thousands of professionals who have accelerated their tech careers with TechGetAfrica."
            />

            <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl font-bold text-red-600">{stat.value}</p>
                  <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-gradient-to-r from-red-700 to-red-600" aria-labelledby="cta-heading">
          <div className="container mx-auto max-w-4xl py-16 px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="cta-heading" className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Transform Your Tech Journey?
            </h2>
            <p className="mt-4 text-lg leading-6 text-red-100">
              Choose from our comprehensive range of services designed to accelerate your success in the African tech ecosystem.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button
                href="/certifications"
                variant="secondary"
                className="text-red-700 bg-white hover:bg-red-50"
              >
                Start Learning
              </Button>
              <Button
                href="/contact"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-red-700"
              >
                Get in Touch
              </Button>
            </div>

            <p className="mt-6 text-sm text-red-100">
              <strong>Flexible solutions available.</strong> From individuals to enterprises.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
