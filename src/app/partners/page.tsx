'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, Globe, Users2, BadgeCheck, Target, Handshake, Award, BookOpen, Briefcase, GraduationCap } from 'lucide-react';
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import Footer from '../componets/Footer';
import Navbar from '../componets/Navbar';

const partnershipTypes = [
  {
    icon: <BookOpen className="h-6 w-6 text-red-600" />,
    title: "Education Partners",
    description: "Collaborate on curriculum development and certification programs",
    benefits: [
      "Co-branded certifications",
      "Access to learning materials",
      "Joint research opportunities"
    ]
  },
  {
    icon: <Briefcase className="h-6 w-6 text-red-600" />,
    title: "Corporate Partners",
    description: "Connect with top talent and upskill your workforce",
    benefits: [
      "Early access to graduates",
      "Custom training programs",
      "Talent pipeline development"
    ]
  },
  {
    icon: <GraduationCap className="h-6 w-6 text-red-600" />,
    title: "Scholarship Partners",
    description: "Sponsor promising students and diversify your talent pool",
    benefits: [
      "Named scholarship programs",
      "Community impact visibility",
      "Diverse candidate pipeline"
    ]
  }
];

const partners = [
  {
    category: "Global Tech Leaders",
    description: "Strategic partnerships with the world's leading technology companies",
    companies: [
      {
        name: "Microsoft",
        logo: "/images/microsoft.png",
        role: "Cloud Infrastructure & Certification Partner",
        description: "Providing Azure certification paths and cloud infrastructure support across our African learning hubs.",
        benefits: [
          "Official Microsoft Certifications",
          "Azure Cloud Credits for students",
          "Technical Resources and Documentation",
          "Microsoft Learn Integration",
          "Access to Microsoft Teams for collaboration"
        ],
        stats: [
          { value: "2,500+", label: "Microsoft certified graduates" },
          { value: "$1M+", label: "In cloud credits provided" }
        ]
      },
      {
        name: "Google",
        logo: "/images/google.svg",
        role: "Technology & Learning Partner",
        description: "Supporting with Google Cloud certifications and developer tools for African tech talent.",
        benefits: [
          "Google Cloud Training Programs",
          "Developer Tools Access",
          "Technical Workshops",
          "Certification Vouchers"
        ],
        stats: [
          { value: "1,200+", label: "Google Cloud certified" },
          { value: "85%", label: "Placement rate for graduates" }
        ]
      },
      {
        name: "AWS",
        logo: "/images/aws.svg",
        role: "Cloud Education Partner",
        description: "Delivering AWS cloud skills training and certification programs across Africa.",
        benefits: [
          "AWS Academy Membership",
          "Cloud Practitioner Pathways",
          "Hands-on Labs",
          "Job Placement Support"
        ],
        stats: [
          { value: "3,000+", label: "AWS certified professionals" },
          { value: "92%", label: "Exam pass rate" }
        ]
      }
    ]
  },
  {
    category: "African Tech Pioneers",
    description: "Collaborations with leading African technology companies driving local innovation",
    companies: [
      {
        name: "Echo Health Phycology",
        logo: "/images/echo.png",
        role: "wellness Partner",
        description: "Providing mental health resources and support for our students and staff.",
        benefits: [
          "Joint Workshops",
          "Mental Health Resources",
          "Wellness Programs",
          "Counseling Services",
          "Employee Assistance Programs",
          "Wellness Challenges",
          "Community Engagement"
        ],
        stats: [
          { value: "500+", label: "Estimated Placements by 2026" },
          { value: "4.8/5", label: "Employer satisfaction" }
        ]
      },
      {
        name: "Paystack",
        logo: "/images/paystack.svg",
        role: "Fintech Education Partner",
        description: "Providing fintech expertise and payment integration for our business programs.",
        benefits: [
          "Payment Gateway Integration",
          "Fintech Curriculum Development",
          "Mentorship Programs",
          "Hackathons",
          "Networking Events",
          "Startup Incubation",
          "Fintech Workshops",
          "Payment API Training",
          "Industry Insights",
        ],
        stats: [
          { value: "200+", label: "Fintech specialists trained" },
          { value: "15", label: "Countries reached" }
        ]
      },
      {
        name: "M-Driva",
        logo: "/images/partners/mkopa.svg",
        role: "IoT & Embedded Systems Partner",
        description: "Developing IoT and embedded systems talent for Africa's growing tech ecosystem.",
        benefits: [
          "Hardware Donations",
          "IoT Lab Sponsorships",
          "Technical Case Studies",
          "Field Training",
          "Mentorship Programs",
          "Hackathons",
          "Research Projects",
          "Networking Events",
          "Internship Opportunities",
          "Industry Insights",
          "Job Placement Support",
          "Scholarships",
        ],
        stats: [
          { value: "10", label: "IoT labs established" },
          { value: "100%", label: "Employment for graduates" }
        ]
      }
    ]
  }
];

const successStories = [
  {
    name: "Microsoft Azure Scholarship Program",
    description: "500 underprivileged students received full scholarships for Azure certifications",
    impact: "92% employment rate within 3 months of certification",
    logo: "/images/microsoft.png"
  },
  {
    name: "Techgetafrica Talent Pipeline",
    description: "Custom training program developed for Techgetafrica's engineering needs",
    impact: "20+ engineers placed in high-growth startups",
    logo: "/images/techgetafrica.png"
  },
  {
    name: "Paystack Fintech Academy",
    description: "Specialized fintech certification program co-developed with Flutterwave",
    impact: "Created 150 new fintech jobs across Africa",
    logo: "/images/paystack.svg"
  }
];

export default function PartnersPage() {
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
                Strategic Alliances
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Powering Africa's Tech</span>
                <span className="block text-red-600">Through Partnerships</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                We collaborate with global tech leaders and African innovators to deliver world-class tech education and create meaningful career pathways.
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/partner-with-us" variant="primary">
                  Become a Partner
                </Button>
                <Button href="/programs" variant="outline">
                  Explore Partner Programs
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Types Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Partnership Opportunities"
              title="Ways to Collaborate"
              description="Join us in building Africa's tech future through these partnership models"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {partnershipTypes.map((type, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    {type.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{type.title}</h3>
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  <ul className="space-y-2">
                    {type.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-500">
                        <BadgeCheck className="flex-shrink-0 h-4 w-4 text-red-500 mr-2 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners Grid Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {partners.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-20 last:mb-0">
                <SectionHeading
                  eyebrow="Partner Network"
                  title={category.category}
                  description={category.description}
                />

                <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {category.companies.map((company, companyIndex) => (
                    <div key={companyIndex} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all">
                      <div className="p-6">
                        <div className="flex items-center mb-6">
                          <div className="flex-shrink-0 h-12 w-12 bg-white rounded-lg shadow-xs p-2 border border-gray-200">
                            <Image 
                              src={company.logo}
                              alt={`${company.name} logo`}
                              width={48}
                              height={48}
                              className="object-contain h-full w-full"
                            />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                            <p className="text-sm text-red-600">{company.role}</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-6">{company.description}</p>
                        
                        <div className="mb-6">
                          <h4 className="font-medium text-gray-900 mb-3">Partnership Benefits:</h4>
                          <ul className="space-y-2">
                            {company.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start text-sm text-gray-500">
                                <Target className="flex-shrink-0 h-4 w-4 text-red-500 mr-2 mt-0.5" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-3">Impact Metrics:</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {company.stats.map((stat, idx) => (
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
            ))}
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Success Stories"
              title="Partnership Impact"
              description="Real-world results from our collaborations with industry leaders"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {successStories.map((story, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-8 border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-white shadow-xs mb-6 p-3">
                    <Image 
                      src={story.logo}
                      alt={`${story.name} logo`}
                      width={64}
                      height={64}
                      className="object-contain h-full w-full"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{story.name}</h3>
                  <p className="text-gray-600 mb-4">{story.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{story.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership Process Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="How It Works"
              title="Our Partnership Process"
              description="A clear pathway to creating impactful collaborations"
              alignment="center"
            />
            
            <div className="mt-16 relative">
              {/* Timeline line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-200 transform -translate-x-1/2" aria-hidden="true"></div>
              
              <div className="grid md:grid-cols-4 gap-8">
                {/* Step 1 */}
                <div className="relative text-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 md:top-1/2 md:-left-4 md:-translate-y-1/2 md:translate-x-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-600 text-white font-bold">1</div>
                  </div>
                  <Handshake className="h-10 w-10 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Initial Discussion</h3>
                  <p className="text-gray-600 text-sm">We explore mutual goals and potential collaboration areas</p>
                </div>
                
                {/* Step 2 */}
                <div className="relative text-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 md:top-1/2 md:-left-4 md:-translate-y-1/2 md:translate-x-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-600 text-white font-bold">2</div>
                  </div>
                  <Users2 className="h-10 w-10 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Needs Assessment</h3>
                  <p className="text-gray-600 text-sm">We identify specific partnership opportunities</p>
                </div>
                
                {/* Step 3 */}
                <div className="relative text-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 md:top-1/2 md:-left-4 md:-translate-y-1/2 md:translate-x-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-600 text-white font-bold">3</div>
                  </div>
                  <BadgeCheck className="h-10 w-10 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Agreement</h3>
                  <p className="text-gray-600 text-sm">We formalize the partnership terms</p>
                </div>
                
                {/* Step 4 */}
                <div className="relative text-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 md:top-1/2 md:-left-4 md:-translate-y-1/2 md:translate-x-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-600 text-white font-bold">4</div>
                  </div>
                  <Globe className="h-10 w-10 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Implementation</h3>
                  <p className="text-gray-600 text-sm">We launch and manage the partnership</p>
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
                Ready to Partner With Us?
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                Join our network of partners committed to building Africa's tech future through education and opportunity.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/partner-with-us" variant="outline">
                  Become a Partner
                </Button>
                <Button href="/contact" variant="outline">
                  Contact Our Team
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