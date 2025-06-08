'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, GraduationCap, Building2, CheckCircle2 } from 'lucide-react';

// Import Components
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import Navbar from '../componets/Navbar';
import Footer from '../componets/Footer';

type UserType = 'student' | 'institution';

export default function EligibilityCheck() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    experience: '',
    goals: '',
    budget: '',
    timeline: '',
    institutionType: '',
    studentCount: '',
    focusAreas: [] as string[],
  });

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setCurrentStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
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
          userType,
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep(3);
      } else {
        // Handle error
        alert('Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
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
              eyebrow="Eligibility Check"
              title="Find Your Perfect Tech Learning Path"
              description="Answer a few questions to discover the best certification programs and training solutions for your needs."
              alignment="center"
            />

            {/* Eligibility Check Form */}
            <div className="mt-12 max-w-3xl mx-auto">
              {currentStep === 1 && (
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Student Option */}
                  <button
                    onClick={() => handleUserTypeSelect('student')}
                    className="bg-gray-50 rounded-lg shadow-md p-8 flex flex-col items-center text-center border border-gray-100 hover:border-red-200 transition-all hover:shadow-lg"
                  >
                    <div className="bg-red-100 rounded-full p-4 mb-4">
                      <GraduationCap className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">I'm a Student</h3>
                    <p className="text-gray-500">
                      Looking to start or advance your tech career through certification programs
                    </p>
                  </button>

                  {/* Institution Option */}
                  <button
                    onClick={() => handleUserTypeSelect('institution')}
                    className="bg-gray-50 rounded-lg shadow-md p-8 flex flex-col items-center text-center border border-gray-100 hover:border-red-200 transition-all hover:shadow-lg"
                  >
                    <div className="bg-red-100 rounded-full p-4 mb-4">
                      <Building2 className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">I'm an Institution</h3>
                    <p className="text-gray-500">
                      Seeking training solutions for your students or employees
                    </p>
                  </button>
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
                        <div className="ml-2 text-sm font-medium text-gray-900">Basic Information</div>
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
                        <div className="ml-2 text-sm font-medium text-gray-500">Additional Details</div>
                      </div>
                    </div>

                    {/* Common Fields */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          placeholder="Enter your full name"
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

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        name="country"
                        id="country"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                        onChange={handleInputChange}
                      >
                        <option value="">Select your country</option>
                        <option value="nigeria">Nigeria</option>
                        <option value="kenya">Kenya</option>
                        <option value="south-africa">South Africa</option>
                        <option value="ghana">Ghana</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {userType === 'student' ? (
                      <>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                              Current Tech Experience Level
                            </label>
                            <select
                              name="experience"
                              id="experience"
                              required
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                              onChange={handleInputChange}
                            >
                              <option value="">Select your experience level</option>
                              <option value="beginner">Beginner (No experience)</option>
                              <option value="intermediate">Intermediate (1-2 years)</option>
                              <option value="advanced">Advanced (3+ years)</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
                              Preferred Timeline
                            </label>
                            <select
                              name="timeline"
                              id="timeline"
                              required
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                              onChange={handleInputChange}
                            >
                              <option value="">Select your preferred timeline</option>
                              <option value="immediate">Immediate (Start within 1 month)</option>
                              <option value="soon">Soon (Start within 3 months)</option>
                              <option value="flexible">Flexible (Start when ready)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-1">
                            Career Goals
                          </label>
                          <textarea
                            name="goals"
                            id="goals"
                            rows={4}
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                            onChange={handleInputChange}
                            placeholder="Tell us about your career goals and what you hope to achieve"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label htmlFor="institutionType" className="block text-sm font-medium text-gray-700 mb-1">
                              Institution Type
                            </label>
                            <select
                              name="institutionType"
                              id="institutionType"
                              required
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                              onChange={handleInputChange}
                            >
                              <option value="">Select your institution type</option>
                              <option value="university">University</option>
                              <option value="college">College</option>
                              <option value="vocational">Vocational School</option>
                              <option value="corporate">Corporate Training</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor="studentCount" className="block text-sm font-medium text-gray-700 mb-1">
                              Number of Students/Employees
                            </label>
                            <input
                              type="number"
                              name="studentCount"
                              id="studentCount"
                              required
                              min="1"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                              placeholder="Enter number of students/employees"
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Areas of Focus
                          </label>
                          <div className="grid gap-3 md:grid-cols-2">
                            {['Cloud Computing', 'Cybersecurity', 'Data Science', 'Software Development', 'Networking'].map((area) => (
                              <label key={area} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                  onChange={() => handleCheckboxChange(area)}
                                />
                                <span className="ml-3 text-gray-700">{area}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

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
                <div className="bg-gray-50 rounded-lg shadow-md p-8 text-center">
                  <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    Thank You for Your Submission!
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Our team will review your information and get back to you within 24 hours with personalized recommendations.
                  </p>
                  <Button
                    href="/courses"
                    variant="primary"
                  >
                    Browse Available Courses
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Additional Information Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Guidance</h3>
                <p className="text-gray-500">
                  Get recommendations based on your experience level, goals, and timeline.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Options</h3>
                <p className="text-gray-500">
                  Choose from self-paced learning, instructor-led training, or hybrid programs.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Support Available</h3>
                <p className="text-gray-500">
                  Access to mentors, career coaches, and a supportive learning community.
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