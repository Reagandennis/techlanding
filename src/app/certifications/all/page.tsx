// src/app/certifications/all/page.tsx
'use client'; // Must be a client component to use Clerk hooks and interact with browser APIs like Paystack

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Clerk imports for authentication state and UI components
import { useAuth, useUser, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

// Icons from lucide-react
import { BadgeCheck, BookOpen, Clock, Award, ChevronRight, Users, BarChart2, Search, Filter, X, LogIn } from 'lucide-react';

// Local component imports (ensure paths are correct)
import Button from '../../componets/Button'; // Assuming Button component exists
import SectionHeading from '../../componets/SectionHeading'; // Assuming SectionHeading component exists
import Footer from '../../componets/Footer'; // Assuming Footer component exists

// Paystack utility import (ensure path is correct)
import { loadPaystack } from '../../utils/paystack'; // Assuming loadPaystack utility exists

// Import data from the new file
// Make sure the path '../../data/certificationData' is correct relative to this file's location
import { certificationPrograms, allCategories, type CertificationProgram } from '../../data/certifications';


// Extend the Window interface to include PaystackPop for type safety
declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number; // Amount in the smallest currency unit (e.g., Kobo for NGN, Cents for KES/USD)
        currency: string; // e.g., 'KES', 'NGN', 'USD'
        ref: string; // Unique transaction reference
        metadata?: Record<string, any>; // Optional metadata
        callback: (response: any) => void; // Called on successful payment
        onClose: () => void; // Called when the Paystack modal is closed
      }) => { openIframe: () => void }; // Function to open the payment iframe
    };
  }
}

// --- Data Structures ---

// CertificationProgram interface is now imported from '../../data/certificationData'

// Define the type for certification benefits shown on the page
interface CertificationBenefit {
    title: string;
    description: string;
    icon: React.ReactNode; // Expecting a JSX element like <IconComponent />
}


// --- Static Data (Replace with your actual data or fetch from an API) ---

// certificationPrograms is now imported from '../../data/certificationData'
// allCategories is now imported from '../../data/certificationData'


// Example Certification Benefits Data (Replace with your actual benefits and icons)
const certificationBenefits: CertificationBenefit[] = [
  { title: "Career Advancement", description: "Boost your resume and open doors to new job opportunities.", icon: <BadgeCheck className="h-8 w-8 text-red-600" /> },
  { title: "Skill Validation", description: "Officially prove your expertise and knowledge to employers.", icon: <Award className="h-8 w-8 text-red-600" /> },
  { title: "Higher Earning Potential", description: "Certified professionals often command better salaries.", icon: <BarChart2 className="h-8 w-8 text-red-600" /> },
  { title: "Industry Recognition", description: "Gain credibility and respect within the tech community.", icon: <Users className="h-8 w-8 text-red-600" /> },
];


// --- React Component ---

function CertificationsPageContent() {
  // Clerk hooks to manage authentication state and user data
  const { isLoaded, isSignedIn, userId } = useAuth(); // Checks if Clerk is loaded, user is signed in, and gets user ID
  const { user } = useUser(); // Gets detailed user object if signed in

  // State for search term and selected filter categories
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // Initialize with the imported certificationPrograms
  const [filteredCertifications, setFilteredCertifications] = useState<CertificationProgram[]>(certificationPrograms);
  const [showFilters, setShowFilters] = useState(false); // State to toggle filter visibility

  // Effect to load the Paystack SDK script when the component mounts
  useEffect(() => {
    loadPaystack(); // Call your utility function to load the script
  }, []);

  // Effect to filter the list of certifications whenever the search term or selected categories change
  useEffect(() => {
    let results = certificationPrograms; // Start with the full list (imported)

    // Apply search term filter (case-insensitive)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(cert =>
        cert.title.toLowerCase().includes(lowerSearchTerm) ||
        cert.description.toLowerCase().includes(lowerSearchTerm) ||
        cert.category.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply category filters
    if (selectedCategories.length > 0) {
      results = results.filter(cert => selectedCategories.includes(cert.category));
    }

    // Update the state with the filtered results
    setFilteredCertifications(results);
  }, [searchTerm, selectedCategories, certificationPrograms]); // Added certificationPrograms to dependency array as it's external

  // Function to toggle a category filter on/off
  const toggleCategory = (category: string) => {
    setSelectedCategories(prevSelected =>
      prevSelected.includes(category)
        ? prevSelected.filter(c => c !== category) // Remove category if already selected
        : [...prevSelected, category] // Add category if not selected
    );
  };

  // Function to handle the "Enroll Now" button click
  const handleEnroll = async (certification: CertificationProgram) => {
    // Check if the user is signed in using Clerk's hook
    // Also check if the primary email address is available (needed for Paystack)
    if (!isSignedIn || !user?.primaryEmailAddress?.emailAddress) {
      console.log('User not signed in or email unavailable for enrollment.');
      alert('Please sign in with a valid email address to enroll.');
      // Optionally, you could trigger the Clerk sign-in modal here
      return; // Stop the enrollment process
    }

    // Retrieve the Paystack public key from environment variables
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      console.error('Paystack public key is not configured in .env.local');
      alert('Payment configuration error. Please contact support.');
      return; // Stop if key is missing
    }

    // Check if the Paystack SDK (PaystackPop) is loaded and available on the window object
    if (typeof window === 'undefined' || !window.PaystackPop) {
      console.error('Paystack SDK (PaystackPop) not loaded or window is undefined.');
      alert('Payment service is initializing. Please wait a moment or refresh the page and try again.');
      loadPaystack(); // Attempt to load it again just in case
      return; // Stop if SDK is not ready
    }

    // Proceed with Paystack payment initialization
    try {
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.primaryEmailAddress.emailAddress, // Use the signed-in user's primary email
        amount: certification.discountPrice * 100, // Convert price to smallest unit (e.g., KES to Cents)
        currency: 'KES', // Set your currency code (ensure it matches your Paystack account)
        ref: `CERT-${certification.id}-${userId}-${Date.now()}`, // Generate a unique transaction reference
        metadata: { // Send useful metadata to Paystack (visible in your dashboard)
          clerkUserId: userId, // Pass the Clerk user ID
          certificationId: certification.id,
          certificationTitle: certification.title,
          customerName: user.fullName || user.firstName || '', // Pass user's name if available
        },
        // Callback function executed after successful payment verification by Paystack
        callback: function(response: any) {
          console.log('Paystack payment successful:', response);
          alert(`Payment successful! Your transaction reference is ${response.reference}. Check your email for confirmation.`);
          // --- IMPORTANT ---
          // TODO: Send the 'response.reference' to your backend API.
          // Your backend MUST verify the transaction status with Paystack using the reference
          // before granting the user access to the certification content.
          // Example: fetch('/api/verify-payment', { method: 'POST', body: JSON.stringify({ reference: response.reference }) });
          // --- /IMPORTANT ---
        },
        // Function called when the user closes the Paystack modal without completing payment
        onClose: function() {
          console.log('Paystack payment modal closed by user.');
          // You might want to show a message, but an alert can be intrusive.
          // alert('Payment window closed.');
        }
      });

      // Open the Paystack payment iframe
      handler.openIframe();

    } catch (error) {
      console.error('Error initiating Paystack payment:', error);
      alert('An error occurred while trying to start the payment process. Please try again.');
    }
  };

  // Show a loading indicator while Clerk is initializing and checking the auth state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
           {/* Optional: Add a spinner */}
          <p className="text-lg font-medium text-gray-700">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // --- Render the Page Content ---
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans"> {/* Using a generic sans-serif font */}

      {/* Header Section */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-red-600">
              TechGet<span className="text-black">Africa</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/accreditation" className="text-gray-700 hover:text-red-600 transition-colors">Accreditation</Link>
            {/* Highlight current page */}
            <Link href="/certifications/all" className="font-semibold text-red-600 border-b-2 border-red-600 pb-1">Certifications</Link>
            <Link href="/careers" className="text-gray-700 hover:text-red-600 transition-colors">Careers</Link>
            <Link href="/resources" className="text-gray-700 hover:text-red-600 transition-colors">Resources</Link>
            <Link href="/community" className="text-gray-700 hover:text-red-600 transition-colors">Community</Link>
          </div>

          {/* Clerk Authentication Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              // If user is signed in, show their name and the UserButton (profile/logout menu)
              <>
                <span className="text-sm text-gray-600">
                  Hi, {user?.firstName || user?.primaryEmailAddress?.emailAddress}
                </span>
                <UserButton afterSignOutUrl="/" /> {/* Redirect to home page after sign out */}
              </>
            ) : (
              // If user is signed out, show Sign In and Sign Up buttons
              <>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  {/* Use your custom Button component or a standard button */}
                  <Button variant="primary" href={''}>
                    Sign Up
                  </Button>
                </SignUpButton>
              </>
            )}
          </div>
          {/* TODO: Add a Mobile Menu button here that toggles visibility of links and auth buttons */}
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">

        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-white to-gray-100 pt-20 pb-24 px-4 sm:px-6 lg:pt-28 lg:pb-32 lg:px-8 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <div className="absolute right-0 bottom-0 w-1/3 h-1/3 bg-red-50 rounded-tl-full opacity-50 blur-2xl"></div>
            <div className="absolute left-0 top-0 w-1/4 h-1/4 bg-gray-100 rounded-br-full opacity-60 blur-xl"></div>
          </div>
          <div className="container mx-auto max-w-7xl relative z-10 text-center">
            <span className="inline-block px-4 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full mb-4 uppercase tracking-wider">
              Validate Your Skills
            </span>
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Professional Tech</span>
              <span className="block text-red-600">Certifications</span>
            </h1>
            <p className="mt-5 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
              Earn industry-recognized credentials designed for the African tech ecosystem. Advance your career with practical skills and validated expertise.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <Button href="#certification-programs" variant="primary">
                Browse Certifications
              </Button>
              <Button href="/certifications/guide" variant="outline" >
                Download Pricing Guide
              </Button>
            </div>
          </div>
        </section>

        {/* Certification Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Why Get Certified?"
              title="Unlock Your Potential"
              description="Discover the tangible advantages our certification programs offer for your career growth in Africa."
              alignment="center"
            />
            {/* Check if benefits data is available */}
            {certificationBenefits.length > 0 ? (
              <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {certificationBenefits.map((benefit, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-red-200 transition-all duration-300 text-center transform hover:-translate-y-1">
                    <div className="flex justify-center mb-5 text-red-600">
                      {/* Render the icon component passed in the data */}
                      {benefit.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center mt-8 text-gray-500">Benefit details coming soon.</p>
            )}
          </div>
        </section>

        {/* Search and Filters Section */}
        <section className="py-12 bg-gray-100 sticky top-16 z-40 shadow-sm"> {/* Make filters sticky below header */}
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="relative flex-grow w-full md:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="search" // Use type="search" for better semantics and potential browser UI
                  placeholder="Search by title, keyword, or category..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search certifications"
                />
              </div>

              {/* Filter Toggle Button */}
              <div className="flex-shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full md:w-auto flex items-center justify-center border border-gray-300 rounded-lg px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-gray-700 shadow-sm text-base font-medium"
                  aria-expanded={showFilters}
                  aria-controls="filter-options" // Link button to the filter panel
                >
                  <Filter className="h-5 w-5 mr-2" aria-hidden="true" />
                  Filters
                  {/* Show badge with count of active filters */}
                  {selectedCategories.length > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {selectedCategories.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Options Panel (conditionally rendered) */}
            {showFilters && (
              <div id="filter-options" className="mt-4 bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-medium text-gray-900">Filter by Category</h3>
                  {/* Show "Clear all" only if filters are selected */}
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={() => setSelectedCategories([])} // Clear all selected categories
                      className="text-sm text-red-600 hover:underline font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((category) => ( /* Uses imported allCategories */
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors duration-150 ${
                        selectedCategories.includes(category)
                          ? 'bg-red-600 border-red-600 text-white font-semibold' // Style for selected filter
                          : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:border-gray-300' // Style for unselected filter
                      }`}
                      aria-pressed={selectedCategories.includes(category)} // Indicate selection state for accessibility
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Certification Programs Listing Section */}
        <section id="certification-programs" className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="text-2xl font-semibold text-gray-900 whitespace-nowrap">
                {/* Display count and correct pluralization */}
                {filteredCertifications.length} Certification Program{filteredCertifications.length !== 1 ? 's' : ''} Found
              </h2>
              {/* Active Filters Display */}
              {selectedCategories.length > 0 && (
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm text-gray-600 mr-1 flex-shrink-0">Filtered by:</span>
                  {selectedCategories.map(category => (
                    <span
                      key={category}
                      className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {category}
                      {/* Button to remove individual filter */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="ml-1.5 flex-shrink-0 text-red-500 hover:text-red-700 focus:outline-none"
                        aria-label={`Remove ${category} filter`}
                      >
                        <X className="h-3 w-3" aria-hidden="true"/>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Certification Grid or No Results Message */}
            {filteredCertifications.length === 0 ? (
              // Message shown when no certifications match filters/search
              <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm mt-10">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true"/>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No certifications found</h3>
                <p className="text-gray-600 mb-6">Your search or filter criteria did not match any of our programs. Try adjusting your search.</p>
                <button
                  onClick={() => {
                    setSearchTerm(''); // Clear search
                    setSelectedCategories([]); // Clear filters
                    setShowFilters(false); // Hide filter panel
                  }}
                  className="inline-flex items-center justify-center px-5 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Clear Search & Filters
                </button>
              </div>
            ) : (
              // Grid display for certification cards
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredCertifications.map((program) => (
                  <article key={program.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg flex flex-col transition-all duration-300 transform hover:-translate-y-1">
                    {/* Image container */}
                    <div className="h-48 bg-gray-200 relative flex-shrink-0">
                      {program.image ? (
                        <Image
                          src={program.image}
                          alt={`${program.title} certification visual`}
                          fill // Use fill for responsive container fitting
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimize image loading based on viewport
                          className="object-cover" // Ensure image covers the area
                          priority={filteredCertifications.indexOf(program) < 3} // Prioritize loading images for the first few cards
                        />
                      ) : (
                        // Placeholder if no image is provided
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <Award className="h-10 w-10" />
                        </div>
                      )}
                      {/* Level Badge */}
                      <div className="absolute top-4 right-4 bg-white text-red-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-md">
                        <Award className="h-3 w-3 mr-1" aria-hidden="true"/>
                        {program.level}
                      </div>
                    </div>

                    {/* Content container */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Category Badge */}
                      <div className="mb-3">
                        <span className="inline-flex items-center bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          {program.category}
                        </span>
                      </div>
                      {/* Title */}
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex-grow">
                        {/* Link to a detailed certification page (optional, adjust href) */}
                        <Link href={`/certifications/${program.id}`} className="hover:text-red-600 transition-colors line-clamp-2">
                          {program.title}
                        </Link>
                      </h3>
                      {/* Description */}
                      <p className="text-gray-600 mb-4 text-sm line-clamp-3">{program.description}</p>

                      {/* Meta Info (Duration, Format) */}
                      <div className="space-y-2 mb-5 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true"/>
                          {program.duration} program
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true"/>
                          {program.format}
                        </div>
                      </div>

                      {/* Pricing Section */}
                      <div className="mb-5 mt-auto"> {/* Pushes pricing and button down */}
                        <div className="flex items-baseline flex-wrap gap-x-2">
                          {/* Discounted Price (the price to pay) */}
                          <span className="text-2xl font-bold text-red-600">
                            KES {program.discountPrice.toLocaleString()}
                          </span>
                          {/* Original Price (if different from discount price) */}
                          {program.price > program.discountPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              KES {program.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {/* Discount Percentage Badge (if applicable) */}
                        {program.price > 0 && program.discountPrice < program.price && (
                          <div className="mt-1">
                            <span className="text-xs bg-green-100 text-green-800 font-medium px-2 py-0.5 rounded-full">
                              SAVE {Math.round(((program.price - program.discountPrice) / program.price) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Enroll Button Area (Conditional based on sign-in status) */}
                      <div className="mt-4">
                        {isSignedIn ? (
                          // If signed in, show the "Enroll Now" button
                          <button
                            onClick={() => handleEnroll(program)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-md transition-colors duration-200 font-medium text-base shadow-sm hover:shadow-md"
                          >
                            Enroll Now
                          </button>
                        ) : (
                          // If signed out, show a "Sign In to Enroll" button that triggers Clerk's modal
                          <SignInButton
                            mode="modal"
                            // Optional: Redirect back to this page after sign-in
                            //redirectUrl={typeof window !== 'undefined' ? window.location.pathname : '/certifications/all'}
                          >
                            <button className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-md transition-colors duration-200 font-medium text-base flex items-center justify-center shadow-sm hover:shadow-md">
                              <LogIn className="h-4 w-4 mr-2" aria-hidden="true"/> Sign In to Enroll
                            </button>
                          </SignInButton>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Certification Process Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:flex gap-16 items-center">
              {/* Text Content */}
              <div className="lg:w-1/2 mb-12 lg:mb-0">
                <SectionHeading
                  eyebrow="How It Works"
                  title="Your Path to Certification"
                  description="Follow these simple steps to earn your professional credential and boost your career."
                  alignment="left"
                />
                <div className="mt-10 space-y-8">
                  {[
                    { title: "Choose Your Path", description: "Select the certification program that aligns with your career goals and current skill level." },
                    { title: "Learn & Practice", description: "Engage with the curriculum, complete hands-on projects, and prepare thoroughly." },
                    { title: "Pass the Exam", description: "Demonstrate your acquired skills and knowledge in our proctored certification assessment." },
                    { title: "Get Certified!", description: "Receive your digital badge and certificate, share your achievement, and join our alumni network." },
                  ].map((step, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 bg-red-100 text-red-700 h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                        <p className="mt-1 text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Image Side */}
              <div className="lg:w-1/2">
                <div className="bg-gray-50 rounded-2xl p-4 shadow-inner">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden shadow">
                    {/* Ensure this image exists in your public folder */}
                    <Image
                      src="/images/certifications/cert-process.jpg" // Example path - replace with your actual image
                      alt="Visual representation of the certification process steps"
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

        {/* Payment Options Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Flexible Investment"
              title="Choose Your Payment Option"
              description="We offer convenient ways to invest in your future. Select the plan that works best for you."
              alignment="center"
            />
            {/* Note: The pricing examples below are hardcoded based on certificationPrograms[0] */}
            {/* Consider making this more dynamic or descriptive if needed */}
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {/* Full Payment Card */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center transform transition duration-300 hover:scale-105 hover:shadow-lg">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-600"><path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.003a.75.75 0 1 0-1.06-1.06l-3.72 3.72-1.72-1.72a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l4.25-4.25Z" clipRule="evenodd" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pay in Full</h3>
                <p className="text-sm text-gray-600 mb-4">Make a single payment upfront and enjoy the best value (includes discount).</p>
                {/* Example Price - Make dynamic if possible */}
                {certificationPrograms[0] && certificationPrograms[0].price > certificationPrograms[0].discountPrice && (
                  <p className="text-sm font-medium text-gray-800">KES {certificationPrograms[0].discountPrice.toLocaleString()} <span className='text-gray-500 line-through'>KES {certificationPrograms[0].price.toLocaleString()}</span></p>
                )}
                {certificationPrograms[0] && certificationPrograms[0].price === certificationPrograms[0].discountPrice && (
                  <p className="text-sm font-medium text-gray-800">KES {certificationPrograms[0].price.toLocaleString()}</p>
                )}
              </div>
              {/* Installment Card */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center transform transition duration-300 hover:scale-105 hover:shadow-lg">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-600"><path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Installment Plan</h3>
                <p className="text-sm text-gray-600 mb-4">Spread the cost over 3 months with our interest-free payment plan.</p>
                {/* Example Price - Make dynamic if possible */}
                {certificationPrograms[0] && certificationPrograms[0].price > 0 && (
                  <p className="text-sm font-medium text-gray-800">3 Payments of KES {(certificationPrograms[0].price / 3).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                )}
              </div>
              {/* Corporate Card */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center transform transition duration-300 hover:scale-105 hover:shadow-lg">
                <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-purple-600"><path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.64l.008-.128a4.125 4.125 0 0 0-3.8-5.364 4.125 4.125 0 0 0-1.455.311V19.128Z" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Corporate Sponsorship</h3>
                <p className="text-sm text-gray-600 mb-4">Empower your team. Ask your employer about sponsoring your certification.</p>
                <p className="text-sm font-medium text-gray-800">Group discounts available.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action (CTA) Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-100">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-red-600 rounded-2xl px-6 py-16 sm:p-20 text-center shadow-xl overflow-hidden relative">
              {/* Optional decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-red-500 opacity-20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-red-500 opacity-20 rounded-full translate-x-1/3 translate-y-1/3"></div>

              <div className="relative z-10">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
                  Ready to Advance Your Tech Career?
                </h2>
                <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                  Invest in yourself with an industry-recognized certification. Find the right program and get started on your path to success today.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                  {/* Use Button component with appropriate variants */}
                  <Button href="#certification-programs" variant="outline" >
                    Explore Certifications
                  </Button>
                  <Button href="/contact" variant="outline" >
                    Contact Admissions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}

// Export the component directly (no HOC needed for public pages)
export default CertificationsPageContent;