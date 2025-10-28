
'use client';

import React from 'react';
import SectionHeading from './SectionHeading';
import Button from './Button';
import Image from 'next/image';
import { CheckCircle, Users, Briefcase, Lightbulb } from 'lucide-react';

export default function RecruitmentAgencyPlatform() {
  return (
    <div className="bg-white py-16 sm:py-24">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-red-600 to-red-800 px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Connect Top African Tech Talent
          </h2>
          <p className="mt-6 text-lg leading-8 text-red-100">
            Our Recruitment Agency Platform streamlines your hiring process, connecting you with certified and job-ready tech professionals across Africa.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button href="#contact" variant="secondary" className="bg-white text-red-600 hover:bg-red-50">
              Request a Demo
            </Button>
            <Button href="#features" variant="outline" className="text-white ring-white hover:bg-white hover:text-red-600">
              Learn More <span aria-hidden="true">→</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="Key Features"
            title="Empowering Your Recruitment Process"
            description="Discover how our platform helps you find the perfect candidates faster and more efficiently."
            alignment="center"
          />

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Users className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Access to Certified Talent</h3>
              <p className="mt-2 text-base text-gray-600">Tap into a pool of professionals with globally recognized certifications from AWS, Microsoft, CompTIA, and more.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Briefcase className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Job-Ready Candidates</h3>
              <p className="mt-2 text-base text-gray-600">Our graduates are equipped with practical skills and real-world project experience, ready to contribute from day one.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Streamlined Matching</h3>
              <p className="mt-2 text-base text-gray-600">Advanced algorithms and dedicated support help you quickly identify candidates that perfectly match your requirements.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Lightbulb className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Pan-African Reach</h3>
              <p className="mt-2 text-base text-gray-600">Source talent from diverse African countries, expanding your recruitment horizons and fostering diversity.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Briefcase className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Dedicated Support</h3>
              <p className="mt-2 text-base text-gray-600">Receive personalized assistance from our team to ensure a smooth and successful recruitment experience.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Users className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Cost-Effective Hiring</h3>
              <p className="mt-2 text-base text-gray-600">Reduce time-to-hire and recruitment costs with our efficient and targeted talent acquisition solutions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="How It Works"
            title="Your Path to Exceptional Talent"
            description="Our simple process ensures you find the right fit for your team."
            alignment="center"
          />

          <div className="mt-16 space-y-16">
            {/* Step 1 */}
            <div className="relative flex flex-col lg:flex-row items-center lg:space-x-12">
              <div className="lg:w-1/2">
                <Image
                  src="/images/recruitment/step1.jpg" // Placeholder image
                  alt="Submit your requirements"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="mt-8 lg:mt-0 lg:w-1/2">
                <span className="text-sm font-semibold text-red-600">Step 1</span>
                <h3 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Submit Your Requirements</h3>
                <p className="mt-4 text-lg leading-8 text-gray-600">Easily submit your job descriptions and candidate preferences through our intuitive platform or directly with our dedicated account managers.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col lg:flex-row-reverse items-center lg:space-x-reverse lg:space-x-12">
              <div className="lg:w-1/2">
                <Image
                  src="/images/recruitment/step2.jpg" // Placeholder image
                  alt="Receive curated candidate profiles"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="mt-8 lg:mt-0 lg:w-1/2">
                <span className="text-sm font-semibold text-red-600">Step 2</span>
                <h3 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Receive Curated Candidate Profiles</h3>
                <p className="mt-4 text-lg leading-8 text-gray-600">Our intelligent matching system and expert recruiters identify the best-fit candidates from our talent pool and present you with detailed profiles.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col lg:flex-row items-center lg:space-x-12">
              <div className="lg:w-1/2">
                <Image
                  src="/images/recruitment/step3.jpg" // Placeholder image
                  alt="Interview and hire top talent"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="mt-8 lg:mt-0 lg:w-1/2">
                <span className="text-sm font-semibold text-red-600">Step 3</span>
                <h3 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Interview and Hire Top Talent</h3>
                <p className="mt-4 text-lg leading-8 text-gray-600">Conduct interviews with pre-vetted candidates and make informed hiring decisions. We support you through the entire process until successful placement.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="contact" className="bg-gradient-to-r from-red-700 to-red-600 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Find Your Next Tech Star?
          </h2>
          <p className="mt-6 text-lg leading-8 text-red-100">
            Partner with TechGetAfrica to access a diverse and highly skilled pool of African tech professionals.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button href="/contact" variant="secondary" className="bg-white text-red-600 hover:bg-red-50">
              Contact Our Recruitment Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
