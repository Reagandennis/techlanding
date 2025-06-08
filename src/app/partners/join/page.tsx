'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Users, Globe, Award, CheckCircle2, ArrowRight } from 'lucide-react';

// Import Components
import Button from '../../componets/Button';
import SectionHeading from '../../componets/SectionHeading';
import Navbar from '../../componets/Navbar';
import Footer from '../../componets/Footer';

type PartnershipType = 'training' | 'recruitment' | 'consulting' | 'technology';

interface PartnershipBenefit {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function PartnerJoin() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    partnershipType: '' as PartnershipType,
    companySize: '',
    industry: '',
    message: '',
  });

  const partnershipBenefits: PartnershipBenefit[] = [
    {
      title: 'Access to Talent Pool',
      description: 'Connect with our network of certified professionals and graduates',
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: 'Training Solutions',
      description: 'Customized training programs for your organization',
      icon: <Award className="h-6 w-6" />,
    },
    {
      title: 'Global Network',
      description: 'Join our international network of tech partners',
      icon: <Globe className="h-6 w-6" />,
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userType: 'partner',
          formData: {
            ...formData,
            submissionDate: new Date().toISOString(),
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setCurrentStep(3);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit your application. Please try again later.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <Navbar />
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-white pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gray-50 rounded-l-3xl"></div>
            <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-red-50 rounded-tl-3xl"></div>
          </div>

          <div className="relative container mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Partner With Us"
              title="Join Our Network of Tech Partners"
              description="Partner with TechGetAfrica to access top talent, training solutions, and business opportunities in the tech industry."
              alignment="center"
            />

            {/* Partnership Form */}
            <div className="mt-12 max-w-3xl mx-auto">
              {currentStep === 1 && (
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      Why Partner With Us?
                    </h3>
                    <p className="text-gray-500">
                      Join our network of leading tech companies and educational institutions
                    </p>
                  </div>

                  <div className="grid gap-8 md:grid-cols-3">
                    {partnershipBenefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-6 text-center"
                      >
                        <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
                          {benefit.icon}
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {benefit.title}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      variant="primary"
                    >
                      Become a Partner
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                  <div className="space-y-8">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center">
                        <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          1
                        </div>
                        <div className="ml-2 text-sm font-medium text-gray-900">Overview</div>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="h-1 bg-gray-200 rounded-full">
                          <div className="h-1 bg-red-600 rounded-full w-1/3"></div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center">
                          2
                        </div>
                        <div className="ml-2 text-sm font-medium text-gray-500">Company Details</div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          id="companyName"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          placeholder="Enter your company name"
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <label htmlFor="partnershipType" className="block text-sm font-medium text-gray-700 mb-1">
                          Partnership Type
                        </label>
                        <select
                          name="partnershipType"
                          id="partnershipType"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          onChange={handleInputChange}
                        >
                          <option value="">Select partnership type</option>
                          <option value="training">Training Partner</option>
                          <option value="recruitment">Recruitment Partner</option>
                          <option value="consulting">Consulting Partner</option>
                          <option value="technology">Technology Partner</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Person
                        </label>
                        <input
                          type="text"
                          name="contactName"
                          id="contactName"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          placeholder="Enter contact person's name"
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          placeholder="Enter your email address"
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          placeholder="Enter your phone number"
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                          Website
                        </label>
                        <input
                          type="url"
                          name="website"
                          id="website"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          placeholder="Enter your website URL"
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Information
                      </label>
                      <textarea
                        name="message"
                        id="message"
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                        placeholder="Tell us about your company and partnership goals"
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="flex justify-between pt-6 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                      >
                        Submit Application
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {currentStep === 3 && (
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                  <div className="text-center">
                    <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      Application Submitted!
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Thank you for your interest in partnering with TechGetAfrica. Our team will review your application and contact you within 2 business days.
                    </p>
                    <Button
                      href="/"
                      variant="primary"
                    >
                      Return to Home
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Partnership Benefits
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Join our network of partners and unlock exclusive benefits for your organization
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Growth</h3>
                <p className="text-gray-500">
                  Access new markets and business opportunities through our network
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Brand Visibility</h3>
                <p className="text-gray-500">
                  Increase your brand presence through our marketing channels
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Resource Access</h3>
                <p className="text-gray-500">
                  Get exclusive access to our training materials and resources
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 