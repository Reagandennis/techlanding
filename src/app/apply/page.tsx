'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, Building2, Users, Target, CheckCircle2, ArrowRight, Lightbulb, TrendingUp, Award } from 'lucide-react';

// Import Components
import Button from '../../components/Button';
import SectionHeading from '../../components/SectionHeading';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

type BusinessType = 'startup' | 'established';

interface ProgramBenefit {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function AcceleratorApply() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '' as BusinessType,
    founderName: '',
    email: '',
    phone: '',
    website: '',
    stage: '',
    funding: '',
    teamSize: '',
    industry: '',
    problem: '',
    solution: '',
    marketSize: '',
    traction: '',
    fundingNeeds: '',
    pitchDeck: null as File | null,
  });

  const programBenefits: ProgramBenefit[] = [
    {
      title: 'Mentorship',
      description: 'Access to industry experts and successful entrepreneurs',
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: 'Funding',
      description: 'Opportunity for seed funding and investor connections',
      icon: <TrendingUp className="h-6 w-6" />,
    },
    {
      title: 'Resources',
      description: 'Access to workspace, tools, and technical support',
      icon: <Award className="h-6 w-6" />,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        pitchDeck: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create FormData object to handle file upload
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          submitData.append(key, value);
        }
      });

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userType: 'accelerator',
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
              eyebrow="Accelerator Program"
              title="Apply to Our Tech Accelerator"
              description="Join our accelerator program to scale your tech startup with mentorship, funding, and resources."
              alignment="center"
            />

            {/* Application Form */}
            <div className="mt-12 max-w-3xl mx-auto">
              {currentStep === 1 && (
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      Program Benefits
                    </h3>
                    <p className="text-gray-500">
                      Join our accelerator program and get access to exclusive resources
                    </p>
                  </div>

                  <div className="grid gap-8 md:grid-cols-3">
                    {programBenefits.map((benefit, index) => (
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
                      Apply Now
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
                        <div className="ml-2 text-sm font-medium text-gray-500">Business Details</div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                          Business Name
                        </label>
                        <input
                          type="text"
                          name="businessName"
                          id="businessName"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          placeholder="Enter your business name"
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                          Business Type
                        </label>
                        <select
                          name="businessType"
                          id="businessType"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          onChange={handleInputChange}
                        >
                          <option value="">Select business type</option>
                          <option value="startup">Startup</option>
                          <option value="established">Established Business</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="founderName" className="block text-sm font-medium text-gray-700 mb-1">
                          Founder/CEO Name
                        </label>
                        <input
                          type="text"
                          name="founderName"
                          id="founderName"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          placeholder="Enter founder/CEO name"
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

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-1">
                          Business Stage
                        </label>
                        <select
                          name="stage"
                          id="stage"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          onChange={handleInputChange}
                        >
                          <option value="">Select business stage</option>
                          <option value="idea">Idea Stage</option>
                          <option value="mvp">MVP</option>
                          <option value="early-traction">Early Traction</option>
                          <option value="growth">Growth Stage</option>
                          <option value="scaling">Scaling</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="funding" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Funding
                        </label>
                        <select
                          name="funding"
                          id="funding"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          onChange={handleInputChange}
                        >
                          <option value="">Select funding stage</option>
                          <option value="bootstrapped">Bootstrapped</option>
                          <option value="friends-family">Friends & Family</option>
                          <option value="seed">Seed</option>
                          <option value="series-a">Series A</option>
                          <option value="series-b">Series B+</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-1">
                        Problem Statement
                      </label>
                      <textarea
                        name="problem"
                        id="problem"
                        rows={3}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                        placeholder="Describe the problem your business is solving"
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="solution" className="block text-sm font-medium text-gray-700 mb-1">
                        Solution
                      </label>
                      <textarea
                        name="solution"
                        id="solution"
                        rows={3}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                        placeholder="Describe your solution and how it works"
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="pitchDeck" className="block text-sm font-medium text-gray-700 mb-1">
                        Pitch Deck
                      </label>
                      <input
                        type="file"
                        name="pitchDeck"
                        id="pitchDeck"
                        accept=".pdf,.ppt,.pptx"
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-red-50 file:text-red-700
                          hover:file:bg-red-100"
                        onChange={handleFileChange}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Upload your pitch deck (PDF, PPT, or PPTX)
                      </p>
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
                      Thank you for applying to our accelerator program. Our team will review your application and contact you within 5 business days.
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

        {/* Program Details Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Program Details
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Our accelerator program provides comprehensive support for tech startups
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Program Duration</h3>
                <p className="text-gray-500">
                  6-month intensive program with flexible scheduling options
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment</h3>
                <p className="text-gray-500">
                  Up to $100,000 in fundraising funding for selected startups from our partners.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Support</h3>
                <p className="text-gray-500">
                  Dedicated mentors, technical resources, and networking opportunities
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