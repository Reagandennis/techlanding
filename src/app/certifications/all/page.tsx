'use client'

import React, { useState, useEffect } from 'react';

// Extend the Window interface to include PaystackPop
declare global {
  interface Window {
    PaystackPop?: any;
  }
}
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, BookOpen, Clock, Award, ChevronRight, Users, BarChart2, Search, Filter, X } from 'lucide-react';
import Button from '../../componets/Button';
import SectionHeading from '../../componets/SectionHeading';
import Footer from '../../componets/Footer';
import { loadPaystack } from '../../utils/paystack';

const certificationPrograms = [
  {
    id: 1,
    title: "Certified Cloud Professional",
    level: "Intermediate",
    duration: "3 months",
    format: "Online + Hands-on Labs",
    price: 45000,
    discountPrice: 38250,
    description: "Master cloud computing fundamentals and gain practical experience with AWS, Azure, and Google Cloud platforms.",
    category: "Cloud Computing",
    image: "/images/certifications/cloud-cert.jpg"
  },
  {
    id: 2,
    title: "Data Science Specialist",
    level: "Advanced",
    duration: "4 months",
    format: "Online + Capstone Project",
    price: 55000,
    discountPrice: 46750,
    description: "Develop expertise in machine learning, statistical analysis, and data visualization techniques.",
    category: "Data Science",
    image: "/images/certifications/data-science-cert.jpg"
  },
  {
    id: 3,
    title: "Cybersecurity Fundamentals",
    level: "Beginner",
    duration: "2 months",
    format: "Online + Virtual Labs",
    price: 35000,
    discountPrice: 29750,
    description: "Learn essential cybersecurity principles and gain hands-on experience with security tools and techniques.",
    category: "Cybersecurity",
    image: "/images/certifications/cyber-cert.jpg"
  },
  {
    id: 4,
    title: "Full Stack Developer",
    level: "Intermediate",
    duration: "3 months",
    format: "Online + Real-world Projects",
    price: 50000,
    discountPrice: 42500,
    description: "Become proficient in both frontend and backend development with modern JavaScript frameworks.",
    category: "Software Development",
    image: "/images/certifications/fullstack-cert.jpg"
  },
  {
    id: 5,
    title: "DevOps Engineer",
    level: "Advanced",
    duration: "4 months",
    format: "Online + CI/CD Pipelines",
    price: 60000,
    discountPrice: 51000,
    description: "Master continuous integration, deployment, and infrastructure as code practices.",
    category: "DevOps",
    image: "/images/certifications/devops-cert.jpg"
  },
  {
    id: 6,
    title: "AI & Machine Learning",
    level: "Advanced",
    duration: "5 months",
    format: "Online + AI Models",
    price: 65000,
    discountPrice: 55250,
    description: "Build and deploy machine learning models for real-world applications.",
    category: "Artificial Intelligence",
    image: "/images/certifications/ai-cert.jpg"
  },
  {
    id: 7,
    title: "Blockchain Developer",
    level: "Intermediate",
    duration: "3 months",
    format: "Online + Smart Contracts",
    price: 48000,
    discountPrice: 40800,
    description: "Learn blockchain fundamentals and develop smart contracts on Ethereum.",
    category: "Blockchain",
    image: "/images/certifications/blockchain-cert.jpg"
  },
  {
    id: 8,
    title: "UX/UI Design Professional",
    level: "Beginner",
    duration: "2 months",
    format: "Online + Design Projects",
    price: 32000,
    discountPrice: 27200,
    description: "Master user experience and interface design principles for digital products.",
    category: "Design",
    image: "/images/certifications/design-cert.jpg"
  },
  {
    id: 9,
    title: "Mobile App Development",
    level: "Intermediate",
    duration: "3 months",
    format: "Online + App Development",
    price: 42000,
    discountPrice: 35700,
    description: "Build cross-platform mobile applications using React Native and Flutter.",
    category: "Mobile Development",
    image: "/images/certifications/mobile-cert.jpg"
  },
  {
    id: 9,
    title: "test",
    level: "Intermediate",
    duration: "3 months",
    format: "Online + App Development",
    price: 50,
    discountPrice: 20,
    description: "Build cross-platform mobile applications using React Native and Flutter.",
    category: "Mobile Development",
    image: "/images/certifications/mobile-cert.jpg"
  },
];

const allCategories = [...new Set(certificationPrograms.map(cert => cert.category))];

const certificationBenefits = [
  {
    title: "Industry-Recognized Credentials",
    description: "Our certifications are valued by employers across Africa's tech industry",
    icon: <BadgeCheck className="h-6 w-6 text-red-600" />
  },
  {
    title: "Practical Skill Development",
    description: "Hands-on projects and labs ensure you gain real-world skills",
    icon: <BookOpen className="h-6 w-6 text-red-600" />
  },
  {
    title: "Career Advancement",
    description: "Certified professionals earn 25% more on average",
    icon: <BarChart2 className="h-6 w-6 text-red-600" />
  },
  {
    title: "Community Access",
    description: "Join our network of certified professionals",
    icon: <Users className="h-6 w-6 text-red-600" />
  }
];

export default function CertificationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredCertifications, setFilteredCertifications] = useState(certificationPrograms);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCert, setSelectedCert] = useState<typeof certificationPrograms[0] | null>(null);

  useEffect(() => {
    let results = certificationPrograms;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(cert => 
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      results = results.filter(cert => selectedCategories.includes(cert.category));
    }
    
    setFilteredCertifications(results);
  }, [searchTerm, selectedCategories]);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleEnroll = async (certification: typeof certificationPrograms[0]) => {
    setSelectedCert(certification);
  
    try {
      if (!window.PaystackPop) {
        console.error('Paystack SDK not loaded.');
        return;
      }
  
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: 'user@example.com', // Replace with user's real email dynamically
        amount: certification?.discountPrice ? certification.discountPrice * 100 : 0, // Paystack uses kobo
        currency: 'KES',
        ref: `${certification.id}-${Date.now()}`,
        callback: function(response: any) {
          console.log('Payment complete:', response);
        },
        onClose: function() {
          console.log('Payment window closed');
        }
      });
  
      handler.openIframe();
    } catch (error) {
      console.error('Error initializing Paystack:', error);
    }
  };
  
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
            <Link href="/certifications" className="text-gray-700 hover:text-red-600 transition-colors">Certifications</Link>
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
                Validate Your Skills
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Professional</span>
                <span className="block text-red-600">Certifications</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                Earn industry-recognized credentials to advance your tech career in Africa.
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="#certification-programs" variant="primary">
                  Browse Certifications
                </Button>
                <Button href="/certifications/guide" variant="outline">
                  Download Pricing Guide
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Certification Benefits */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Why Get Certified"
              title="Benefits of Certification"
              description="How our certification programs can help your career"
              alignment="center"
            />
            
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {certificationBenefits.map((benefit, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-center">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                  <p className="mt-2 text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search certifications..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-white hover:bg-gray-100 transition-colors"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                {selectedCategories.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                    {selectedCategories.length}
                  </span>
                )}
              </button>
            </div>
            
            {showFilters && (
              <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-900">Filter by Category</h3>
                  <button 
                    onClick={() => setSelectedCategories([])}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        selectedCategories.includes(category)
                          ? 'bg-red-100 border-red-300 text-red-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Certification Programs */}
        <section id="certification-programs" className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredCertifications.length} Certification Programs
              </h2>
              {selectedCategories.length > 0 && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Filtered by:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map(category => (
                      <span 
                        key={category} 
                        className="inline-flex items-center bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
                      >
                        {category}
                        <button 
                          onClick={() => toggleCategory(category)}
                          className="ml-1 text-red-600 hover:text-red-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {filteredCertifications.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No certifications found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                <div 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategories([]);
                  }}
                >
                  <Button 
                                      variant="outline" href={''}>
                    Clear all filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredCertifications.map((program) => (
                  <article key={program.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all">
                    <div className="h-48 bg-gray-200 relative">
                      <Image
                        src={program.image}
                        alt={program.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-white text-red-600 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        <Award className="h-3 w-3 mr-1" />
                        {program.level}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {program.category}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">
                        <Link href={`/certifications/${program.id}`} className="hover:text-red-600 transition-colors">
                          {program.title}
                        </Link>
                      </h2>
                      <p className="text-gray-600 mb-4">{program.description}</p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          {program.duration} program
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <BookOpen className="h-4 w-4 mr-2" />
                          {program.format}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-end">
                          <span className="text-2xl font-bold text-red-600">
                            KES {program.discountPrice.toLocaleString()}
                          </span>
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            KES {program.price.toLocaleString()}
                          </span>
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            {Math.round((1 - program.discountPrice/program.price) * 100)}% OFF
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Early bird pricing</p>
                      </div>
                      
                      <div className="mt-4">
                          <button 
                          onClick={() => handleEnroll(program)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                        >
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Certification Process */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:flex gap-12 items-center">
              <div className="lg:w-1/2 mb-12 lg:mb-0">
                <SectionHeading
                  eyebrow="Getting Certified"
                  title="How Our Certification Process Works"
                  description="Simple steps to earn your professional certification"
                  alignment="left"
                />
                
                <div className="mt-8 space-y-8">
                  <div className="flex">
                    <div className="flex-shrink-0 bg-red-100 text-red-600 h-10 w-10 rounded-full flex items-center justify-center mr-4">
                      1
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Choose Your Certification</h3>
                      <p className="mt-1 text-gray-600">
                        Select from our range of certification programs based on your career goals and skill level.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 bg-red-100 text-red-600 h-10 w-10 rounded-full flex items-center justify-center mr-4">
                      2
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Complete the Program</h3>
                      <p className="mt-1 text-gray-600">
                        Work through the curriculum, complete hands-on projects, and prepare for your certification exam.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 bg-red-100 text-red-600 h-10 w-10 rounded-full flex items-center justify-center mr-4">
                      3
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Pass the Certification Exam</h3>
                      <p className="mt-1 text-gray-600">
                        Demonstrate your skills by passing our rigorous certification assessment.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 bg-red-100 text-red-600 h-10 w-10 rounded-full flex items-center justify-center mr-4">
                      4
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Get Certified</h3>
                      <p className="mt-1 text-gray-600">
                        Receive your digital badge and certificate, and join our community of certified professionals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src="/images/certifications/cert-process.jpg"
                      alt="Certification process"
                      width={800}
                      height={450}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Options */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Flexible Payments"
              title="Payment Options"
              description="We offer multiple payment methods for your convenience"
              alignment="center"
            />
            
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="bg-red-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Payment</h3>
                <p className="text-gray-600 mb-4">Pay the full amount upfront and save 15%</p>
                <p className="text-sm text-gray-500">KES 38,250 instead of KES 45,000</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="bg-red-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Installment Plan</h3>
                <p className="text-gray-600 mb-4">Pay in 3 monthly installments with no interest</p>
                <p className="text-sm text-gray-500">KES 15,000 per month for 3 months</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="bg-red-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Corporate Sponsorship</h3>
                <p className="text-gray-600 mb-4">Get your employer to sponsor your certification</p>
                <p className="text-sm text-gray-500">Special rates for group enrollments</p>
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
                Take the next step in your tech career with an industry-recognized certification.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/certifications/browse" variant="outline">
                  Browse All Certifications
                </Button>
                <Button href="/contact" variant="outline">
                  Speak to an Advisor
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