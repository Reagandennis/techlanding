'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Award, Check, Cloud, Lock, Code, Database, Briefcase, Network, BookOpen, Users, Globe, BadgeCheck } from 'lucide-react';
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import Footer from '../componets/Footer';

const certificationCategories = [
  {
    title: "Cloud Computing",
    icon: <Cloud className="h-8 w-8 text-red-600" />,
    description: "Industry-leading cloud certifications that validate your expertise in cloud architecture, deployment, and management.",
    providers: [
      {
        name: "AWS",
        logo: "/images/aws.svg",
        programs: ["Cloud Practitioner", "Solutions Architect", "Developer", "SysOps Administrator"],
        benefits: ["Hands-on labs", "Exam vouchers", "Practice tests", "Job placement support"]
      },
      {
        name: "Microsoft Azure",
        logo: "/images/microsoft.png",
        programs: ["Azure Fundamentals", "Azure Administrator", "Azure Developer", "Azure Architect"],
        benefits: ["Microsoft Learn access", "Sandbox environment", "Technical mentorship", "Exam prep"]
      },
      {
        name: "Google Cloud",
        logo: "/images/google.svg",
        programs: ["Cloud Digital Leader", "Associate Engineer", "Professional Architect", "Data Engineer"],
        benefits: ["Google Cloud credits", "Qwiklabs access", "Study guides", "Community support"]
      }
    ]
  },
  {
    title: "Cybersecurity",
    icon: <Lock className="h-8 w-8 text-red-600" />,
    description: "Comprehensive security certifications covering network security, threat detection, and security management.",
    providers: [
      {
        name: "CompTIA",
        logo: "/images/Comptia.svg",
        programs: ["Security+", "CySA+", "PenTest+", "CASP+"],
        benefits: ["Exam objectives", "Practice questions", "Study groups", "Career pathways"]
      },
      {
        name: "ISC2",
        logo: "/images/ics2.png",
        programs: ["CISSP", "CCSP", "SSCP", "CAP"],
        benefits: ["Official study materials", "Continuing education", "Professional network", "Job board"]
      },
      {
        name: "Cisco",
        logo: "/images/cisco.png",
        programs: ["CCNA Security", "CCNP Security", "CCIE Security", "CyberOps"],
        benefits: ["Networking labs", "Virtual training", "Certification tracker", "Career resources"]
      }
    ]
  },
  {
    title: "Software Development",
    icon: <Code className="h-8 w-8 text-red-600" />,
    description: "Professional certifications in software development, programming languages, and development methodologies.",
    providers: [
      {
        name: "Oracle",
        logo: "/images/oracle.png",
        programs: ["Java Certifications", "Database Certifications", "Cloud Certifications", "Application Development"],
        benefits: ["Official curriculum", "Practice exams", "Developer community", "Technical resources"]
      },
      {
        name: "Microsoft",
        logo: "/images/microsoft.png",
        programs: ["MTA", "MCSA", "MCSD", "Azure Developer"],
        benefits: ["Learning paths", "Developer tools", "Exam discounts", "Technical support"]
      },
      {
        name: "Red Hat",
        logo: "/images/redhat.png",
        programs: ["RHCSA", "RHCE", "OpenShift", "Ansible"],
        benefits: ["Hands-on exams", "Performance-based", "Enterprise focus", "Linux specialization"]
      }
    ]
  }
];

const accreditationBenefits = [
  {
    icon: <Globe className="h-8 w-8 text-red-600" />,
    title: "Global Recognition",
    description: "Our certifications are recognized by employers worldwide, opening doors to international opportunities."
  },
  {
    icon: <Briefcase className="h-8 w-8 text-red-600" />,
    title: "Career Advancement",
    description: "Certified professionals earn 20-40% more than their non-certified peers on average."
  },
  {
    icon: <BadgeCheck className="h-8 w-8 text-red-600" />,
    title: "Industry Validation",
    description: "Prove your skills with credentials that are developed and maintained by technology leaders."
  },
  {
    icon: <Users className="h-8 w-8 text-red-600" />,
    title: "Community Access",
    description: "Join exclusive networks of certified professionals and industry experts."
  }
];

const examPreparation = [
  {
    step: "1",
    title: "Assessment",
    description: "Evaluate your current skills to identify knowledge gaps",
    icon: <BookOpen className="h-6 w-6 text-white" />
  },
  {
    step: "2",
    title: "Learning Plan",
    description: "Customized study path based on your assessment results",
    icon: <BookOpen className="h-6 w-6 text-white" />
  },
  {
    step: "3",
    title: "Training",
    description: "Instructor-led and self-paced learning materials",
    icon: <BookOpen className="h-6 w-6 text-white" />
  },
  {
    step: "4",
    title: "Practice",
    description: "Mock exams and hands-on labs to build confidence",
    icon: <BookOpen className="h-6 w-6 text-white" />
  },
  {
    step: "5",
    title: "Certification",
    description: "Schedule and pass your official certification exam",
    icon: <BookOpen className="h-6 w-6 text-white" />
  }
];

export default function AccreditationPage() {
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
            <Link href="/partners" className="text-gray-700 hover:text-red-600 transition-colors">Partners</Link>
            <Link href="/resources" className="text-gray-700 hover:text-red-600 transition-colors">Resources</Link>
            <Link href="/communities" className="text-gray-700 hover:text-red-600 transition-colors">Community</Link>
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
                Global Standards
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Globally Recognized</span>
                <span className="block text-red-600">Tech Certifications</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                Earn industry-standard credentials that validate your skills and open doors to international career opportunities.
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/certifications" variant="primary">
                  Browse Certifications
                </Button>
                <Button href="/contact" variant="outline">
                  Speak to an Advisor
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Accreditation Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Why Get Certified?"
              title="The Value of Tech Certifications"
              description="How professional certifications can accelerate your career growth"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {accreditationBenefits.map((benefit, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
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

        {/* Certification Programs Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {certificationCategories.map((category, index) => (
              <div key={index} className="mb-20 last:mb-0">
                <SectionHeading
                  eyebrow="Certification Paths"
                  title={category.title}
                  description={category.description}
                />

                <div className="mt-12 grid gap-8 md:grid-cols-3">
                  {category.providers.map((provider, providerIndex) => (
                    <div key={providerIndex} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all">
                      <div className="p-6">
                        <div className="flex items-center mb-6">
                          <div className="flex-shrink-0 h-12 w-12 bg-white rounded-lg shadow-xs p-2 border border-gray-200">
                            <Image 
                              src={provider.logo}
                              alt={`${provider.name} logo`}
                              width={48}
                              height={48}
                              className="object-contain h-full w-full"
                            />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
                            <p className="text-sm text-red-600">{category.title} Certifications</p>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="font-medium text-gray-900 mb-3">Available Programs:</h4>
                          <ul className="space-y-2">
                            {provider.programs.map((program, idx) => (
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
                            {provider.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start text-sm text-gray-500">
                                <Check className="flex-shrink-0 h-4 w-4 text-green-500 mr-2 mt-0.5" />
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
            ))}
          </div>
        </section>

        {/* Exam Preparation Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Approach"
              title="Certification Success Path"
              description="Our proven 5-step process to help you prepare for and pass your certification exams"
              alignment="center"
            />
            
            <div className="mt-16 relative">
              {/* Timeline line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-200 transform -translate-x-1/2" aria-hidden="true"></div>
              
              <div className="grid md:grid-cols-5 gap-8">
                {examPreparation.map((step, index) => (
                  <div key={index} className="relative text-center bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 md:top-1/2 md:-left-4 md:-translate-y-1/2 md:translate-x-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-600 text-white font-bold">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
                      {step.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Certification Success Stories */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Success Stories"
              title="Certified Professionals"
              description="Hear from individuals who transformed their careers through certification"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {/* Story 1 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden">
                      <Image 
                        src="/images/success/john.jpg"
                        alt="John profile"
                        width={64}
                        height={64}
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">John M.</h3>
                      <p className="text-sm text-red-600">AWS Solutions Architect</p>
                    </div>
                  </div>
                  <blockquote className="italic text-gray-600 mb-6">
                    "Earning my AWS certification through TechGetAfrica opened doors I never thought possible. Within a month, I had three job offers with international companies."
                  </blockquote>
                  <div className="flex items-center text-sm text-gray-500">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Certified: AWS Solutions Architect - Professional</span>
                  </div>
                </div>
              </div>
              
              {/* Story 2 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden">
                      <Image 
                        src="/images/success/amina.jpg"
                        alt="Amina profile"
                        width={64}
                        height={64}
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Amina K.</h3>
                      <p className="text-sm text-red-600">Cybersecurity Analyst</p>
                    </div>
                  </div>
                  <blockquote className="italic text-gray-600 mb-6">
                    "The CISSP certification program gave me the credibility to transition from IT support to cybersecurity with a 60% salary increase."
                  </blockquote>
                  <div className="flex items-center text-sm text-gray-500">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Certified: CISSP</span>
                  </div>
                </div>
              </div>
              
              {/* Story 3 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden">
                      <Image 
                        src="/images/success/david.jpg"
                        alt="David profile"
                        width={64}
                        height={64}
                        className="object-cover h-full w-full"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">David O.</h3>
                      <p className="text-sm text-red-600">Cloud Developer</p>
                    </div>
                  </div>
                  <blockquote className="italic text-gray-600 mb-6">
                    "The structured preparation for my Microsoft Azure certifications gave me the confidence to pass all exams on the first attempt."
                  </blockquote>
                  <div className="flex items-center text-sm text-gray-500">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Certified: Azure Developer Associate</span>
                  </div>
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
                Ready to Get Certified?
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                Take the first step toward validating your skills and advancing your career.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/certifications" variant="outline">
                  Browse Certifications
                </Button>
                <Button href="/eligibility-check" variant="outline">
                  Check Eligibility
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