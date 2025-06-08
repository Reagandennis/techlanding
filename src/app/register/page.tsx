'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, GraduationCap, Building2, Download, BookOpen, Code, FileText, Video, CheckCircle2 } from 'lucide-react';

// Import Components
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import Navbar from '../componets/Navbar';
import Footer from '../componets/Footer';

type UserType = 'student' | 'institution';

interface Resource {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  downloadUrl: string;
  category: 'documentation' | 'software' | 'tutorial' | 'certification';
  fileSize?: string;
}

export default function Register() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    role: '',
    country: '',
  });

  // Resources data
  const resources: Resource[] = [
    {
      id: 'aws-simulator',
      title: 'AWS Cloud Simulator',
      description: 'Practice AWS services in a safe, simulated environment',
      icon: <Code className="h-6 w-6" />,
      downloadUrl: '/api/download?id=aws-simulator',
      category: 'software',
      fileSize: '250 MB'
    },
    {
      id: 'security-guide',
      title: 'Security Best Practices Guide',
      description: 'Comprehensive guide for implementing security measures',
      icon: <FileText className="h-6 w-6" />,
      downloadUrl: '/api/download?id=security-guide',
      category: 'documentation',
      fileSize: '15 MB'
    },
    {
      id: 'cloud-tutorial',
      title: 'Cloud Computing Tutorial Series',
      description: 'Step-by-step video tutorials for cloud concepts',
      icon: <Video className="h-6 w-6" />,
      downloadUrl: '/api/download?id=cloud-tutorial',
      category: 'tutorial',
      fileSize: '1.2 GB'
    },
    {
      id: 'cert-prep',
      title: 'Certification Preparation Kit',
      description: 'Practice tests and study materials for certifications',
      icon: <BookOpen className="h-6 w-6" />,
      downloadUrl: '/api/download?id=cert-prep',
      category: 'certification',
      fileSize: '500 MB'
    }
  ];

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setCurrentStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic here
    setCurrentStep(3);
  };

  const handleDownload = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/download?id=${resourceId}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `${resourceId}.zip`;

      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download the file. Please try again later.');
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
              eyebrow="Create Account"
              title="Access Learning Resources and Tools"
              description="Register to get access to our comprehensive learning materials, simulators, and certification resources."
              alignment="center"
            />

            {/* Registration Form */}
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Account</h3>
                    <p className="text-gray-500">
                      Access learning materials, practice tests, and certification resources
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Institution Account</h3>
                    <p className="text-gray-500">
                      Access teaching resources, management tools, and bulk licensing
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
                        <div className="ml-2 text-sm font-medium text-gray-900">Account Type</div>
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
                        <div className="ml-2 text-sm font-medium text-gray-500">Account Details</div>
                      </div>
                    </div>

                    {/* Form Fields */}
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

                    {userType === 'institution' && (
                      <div>
                        <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                          Organization Name
                        </label>
                        <input
                          type="text"
                          name="organization"
                          id="organization"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          placeholder="Enter your organization name"
                          onChange={handleInputChange}
                        />
                      </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          placeholder="Create a password"
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          required
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors duration-200"
                          placeholder="Confirm your password"
                          onChange={handleInputChange}
                        />
                      </div>
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
                        Create Account
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
                      Account Created Successfully!
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Welcome to TechGetAfrica. You now have access to all our learning resources.
                    </p>
                  </div>

                  {/* Resources Grid */}
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Resources</h4>
                    <div className="grid gap-6 md:grid-cols-2">
                      {resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:border-red-200 transition-all hover:shadow-md"
                        >
                          <div className="flex items-start">
                            <div className="bg-red-100 rounded-lg p-3">
                              {resource.icon}
                            </div>
                            <div className="ml-4 flex-grow">
                              <h5 className="text-lg font-medium text-gray-900">{resource.title}</h5>
                              <p className="text-gray-500 mt-1">{resource.description}</p>
                              <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-gray-500">{resource.fileSize}</span>
                                <Button
                                  onClick={() => handleDownload(resource.id)}
                                  variant="outline"
                                  className="ml-4"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Practice Labs</h3>
                <p className="text-gray-500">
                  Access our virtual labs to practice real-world scenarios in a safe environment.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Study Materials</h3>
                <p className="text-gray-500">
                  Download comprehensive study guides, practice tests, and video tutorials.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Access</h3>
                <p className="text-gray-500">
                  Join our community forums and get help from peers and mentors.
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
