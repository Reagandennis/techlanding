import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Better image optimization
import { ArrowRight, Briefcase, Rocket, Users, Calendar, Award, GraduationCap } from 'lucide-react';
import ClientNavbar from './componets/ClientNavbar';

interface LMSCourse {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  level: string;
  duration: number; // in hours
  instructor: {
    name: string;
  };
  categories: Array<{
    category: {
      name: string;
    };
  }>;
  _count: {
    lessons: number;
    enrollments: number;
  };
}

// Import Components
import PartnerLogo from '../shared/components/common/PartnerLogo';
import Footer from '../shared/components/layout/Footer';
import Button from '../shared/components/ui/Button';
import SectionHeading from '../shared/components/common/SectionHeading';
import TestimonialCard from '../shared/components/common/TestimonialCard';

// Types
import CourseCard, { CourseCardProps } from '../features/education/components/CourseCard';
import Navbar from '../shared/components/layout/Navbar';

export default function HomePage() {
  // Static featured courses data
  const featuredCourses: CourseCardProps[] = [
    {
      id: 'aws-cloud-practitioner',
      title: 'AWS Certified Cloud Practitioner',
      description: 'Master foundational AWS concepts and earn the industry-recognized AWS Cloud Practitioner certification.',
      duration: '6 weeks',
      level: 'Beginner',
      provider: 'AWS',
      imageSrc: '/images/courses/aws-cloud-practitioner.jpg',
      imageAlt: 'AWS Cloud Practitioner Certification',
      badges: ['High Demand', 'Entry Level'],
      href: '/courses'
    },
    {
      id: 'comptia-security-plus',
      title: 'CompTIA Security+',
      description: 'Gain essential cybersecurity skills with this globally recognized credential for security professionals.',
      duration: '8 weeks',
      level: 'Intermediate',
      provider: 'CompTIA',
      imageSrc: '/images/courses/comptia-security-plus.jpg',
      imageAlt: 'CompTIA Security+ Certification',
      badges: ['Top Rated', 'High Salary'],
      href: '/courses'
    },
    {
      id: 'microsoft-azure-fundamentals',
      title: 'Microsoft Azure Fundamentals',
      description: 'Build cloud computing expertise with Microsoft Azure and prepare for the AZ-900 certification exam.',
      duration: '4 weeks',
      level: 'Beginner',
      provider: 'Microsoft',
      imageSrc: '/images/courses/azure-fundamentals.jpg',
      imageAlt: 'Microsoft Azure Fundamentals Certification',
      badges: ['Fast Track', 'Entry Level'],
      href: '/courses'
    },
  ];

  // Partner logos - can be loaded from API/CMS later
  const partners = [
    { name: "AWS", logoSrc: "/images/aws.svg", href: "/partners/aws" },
    { name: "Cisco", logoSrc: "/images/cisco.png", href: "/partners/cisco" },
    { name: "CompTIA", logoSrc: "/images/Comptia.svg", href: "/partners/comptia" },
    { name: "Microsoft", logoSrc: "/images/microsoft.png", href: "/partners/microsoft" },
    { name: "Google", logoSrc: "/images/google.svg", href: "/partners/google" },
    { name: "ISC2", logoSrc: "/images/ics2.png", href: "/partners/isc2" },
  ];

  // Testimonials data - can be loaded from API/CMS later
  const testimonials = [
    {
      id: 1,
      quote: "TechGetAfrica transformed my career. I went from having no tech background to landing a cloud engineer role at a major company within 6 months of completing my AWS certification.",
      author: "Sarah Nkosi",
      role: "Cloud Engineer",
      company: "TechCorp Africa",
      imageSrc: "/images/testimonials/sarah.jpg",
      location: "Nairobi, Kenya"
    },
    {
      id: 2,
      quote: "The structured curriculum and mentorship program helped me build confidence in my technical abilities. The community support was invaluable throughout my learning journey.",
      author: "Emmanuel Okafor",
      role: "Network Security Specialist",
      company: "SecureNet Solutions",
      imageSrc: "/images/testimonials/emmanuel.jpg",
      location: "Lagos, Nigeria"
    }
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
      {/* --- Navigation --- */}
      {/* Consider making your Header/Nav a separate client component */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
      <Navbar />
      </header>

      <main className="flex-grow">
        {/* --- Hero Section --- */}
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
                <span className="block text-red-600 xl:inline">with World-Class Accreditation in Africa</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl lg:mx-0">
                TechGetAfrica provides globally recognized certifications and training programs, empowering Africans to launch and advance their careers in the technology sector.
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
                <Button href="/courses" variant="primary">
                  Explore Courses
                </Button>
                <Button href="/eligibility-check" variant="secondary">
                  Check Eligibility
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="mt-12 lg:mt-0 relative">
              {/* Add next/image for better performance */}
              <div className="rounded-lg shadow-xl overflow-hidden aspect-video">
                <Image
                  src="/images/anorld.jpeg"
                  alt="Diverse group of African students learning technology with techgetafrica"
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
                  <p className="font-semibold text-gray-900">Recognized Globally</p>
                  <p className="text-sm text-gray-500">Industry-standard certifications</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Partners Section --- */}
        <section
          className="bg-gray-50 py-12 sm:py-16"
          aria-labelledby="partners-heading"
        >
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2
              id="partners-heading"
              className="text-center text-sm font-semibold uppercase text-gray-500 tracking-wider mb-8"
            >
              In Partnership With World Leaders in Technology
            </h2>

            {/* Grid for Partner Logos */}
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
              Our accreditation partners offer industry-recognized certifications that are in high demand across Africa and globally, ensuring your skills are validated by the best in the industry.
            </p>
          </div>
        </section>

        {/* --- Key Offerings Section --- */}
        <section
          id="programs"
          className="bg-white py-16 sm:py-20"
          aria-labelledby="offerings-heading"
        >
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <SectionHeading
              eyebrow="Our Programs"
              title="Your Gateway to Tech Excellence"
              description="Choose from a wide range of accreditation paths designed for every stage of your tech journey."
              id="offerings-heading"
            />

            {/* Offering Cards Grid */}
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Offering Card 1: Industry Accreditation */}
              <div className="bg-gray-50 rounded-lg shadow-md p-6 flex flex-col border border-gray-100 hover:border-red-200 transition-all hover:shadow-lg">
                <div className="flex-shrink-0">
                  <div className="bg-red-100 rounded-lg p-3 inline-flex">
                    <Award className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">Industry Accreditation</h3>
                <p className="mt-2 text-base text-gray-500 flex-grow">
                  Gain certifications from global leaders like AWS, Cisco, CompTIA, Microsoft, Google, and (ISC)². Our programs prepare you for certification exams with hands-on labs and practice tests.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 text-green-500">✓</span> Globally recognized credentials
                  </li>
                  <li className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 text-green-500">✓</span> Exam preparation included
                  </li>
                  <li className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 text-green-500">✓</span> Self-paced and instructor-led options
                  </li>
                </ul>
                <div className="mt-4">
                  <Link href="/accreditation" className="text-base font-medium text-red-600 hover:text-red-700 inline-flex items-center">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Offering Card 2: Accelerator Programs */}
              <div className="bg-gray-50 rounded-lg shadow-md p-6 flex flex-col border border-gray-100 hover:border-red-200 transition-all hover:shadow-lg">
                <div className="flex-shrink-0">
                  <div className="bg-red-100 rounded-lg p-3 inline-flex">
                    <Rocket className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">Accelerator Programs</h3>
                <p className="mt-2 text-base text-gray-500 flex-grow">
                  Fast-track your career with intensive bootcamps and specialized training designed for rapid skill acquisition. Programs range from 8-16 weeks with mentorship from industry experts.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 text-green-500">✓</span> Project-based learning
                  </li>
                  <li className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 text-green-500">✓</span> 1:1 Career coaching
                  </li>
                  <li className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 text-green-500">✓</span> Job placement assistance
                  </li>
                </ul>
                <div className="mt-4">
                  <Link href="/programs/accelerator" className="text-base font-medium text-red-600 hover:text-red-700 inline-flex items-center">
                    Discover Programs <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Offering Card 3: Community & Events */}
              <div className="bg-gray-50 rounded-lg shadow-md p-6 flex flex-col border border-gray-100 hover:border-red-200 transition-all hover:shadow-lg">
                <div className="flex-shrink-0">
                  <div className="bg-red-100 rounded-lg p-3 inline-flex">
                    <Users className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">Community & Events</h3>
                <p className="mt-2 text-base text-gray-500 flex-grow">
                  Connect with peers, mentors, and industry experts through our vibrant community, webinars, hackathons, and networking events across the continent.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 text-green-500">✓</span> Monthly tech talks
                  </li>
                  <li className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 text-green-500">✓</span> Peer-to-peer learning
                  </li>
                  <li className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 text-green-500">✓</span> Industry networking
                  </li>
                </ul>
                <div className="mt-4">
                  <Link href="/community" className="text-base font-medium text-red-600 hover:text-red-700 inline-flex items-center">
                    Join Us <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* View All Programs button */}
            <div className="mt-12 text-center">
              <Button href="/programs" variant="outline">
                View All Programs
              </Button>
            </div>
          </div>
        </section>

        {/* --- Featured Courses Section (New) --- */}
        <section className="bg-gray-50 py-16 sm:py-20" aria-labelledby="featured-courses-heading">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Top Certifications"
              title="In-Demand Skills for African Tech Professionals"
              description="Our most popular certification programs, designed to help you build critical skills that employers are looking for."
              id="featured-courses-heading"
              alignment="left"
            />

            {/* Course Cards */}
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>

            {/* View All Courses button */}
            <div className="mt-12 text-center">
              <Button href="/courses" variant="primary">
                View All Courses
              </Button>
            </div>
          </div>
        </section>

        {/* --- Testimonials Section (New) --- */}
        <section className="bg-white py-16 sm:py-20" aria-labelledby="testimonials-heading">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Success Stories"
              title="Hear From Our Graduates"
              description="Join thousands of professionals who have transformed their careers through TechGetAfrica's certification programs."
              id="testimonials-heading"
            />

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl font-bold text-red-600">{stat.value}</p>
                  <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="mt-16 grid gap-8 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-100"
                >
                  {/* Quote Icon */}
                  <svg className="h-8 w-8 text-red-200 mb-4" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>

                  <p className="text-gray-700 italic mb-4">{testimonial.quote}</p>

                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                      {/* Placeholder for testimonial image */}
                      {/* Using Next/Image for placeholder as well */}
                      <Image
                        src="/images/placeholder-avatar.png" // Path relative to your public directory
                        alt={testimonial.author}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-semibold text-gray-900">{testimonial.author}</h4>
                      <p className="text-xs text-gray-500">{testimonial.role}, {testimonial.company}</p>
                      <p className="text-xs text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Read More Stories button */}
            <div className="mt-12 text-center">
              <Button href="/success-stories" variant="outline">
                Read More Success Stories
              </Button>
            </div>
          </div>
        </section>

        {/* --- Call to Action Section --- */}
        <section className="bg-gradient-to-r from-red-700 to-red-600" aria-labelledby="cta-heading">
          <div className="container mx-auto max-w-4xl py-16 px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="cta-heading" className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Transform Your Tech Career?
            </h2>
            <p className="mt-4 text-lg leading-6 text-red-100">
              Join thousands of African tech professionals who have accelerated their careers through our globally recognized certification programs.
            </p>

            {/* CTA Options */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button
                href="/courses"
                variant="secondary"
                className="text-red-700 bg-white hover:bg-red-50"
              >
                Browse Courses
              </Button>
              <Button
                href="/eligibility-check"
                variant="outline"
                className="text-red-700 bg-white hover:bg-red-50"
              >
                Check Your Eligibility
              </Button>
            </div>

            {/* Financing note */}
            <p className="mt-6 text-m text-red-100">
              <b>Flexible financing options and scholarships available.</b>  No upfront payment required.
            </p>
          </div>
        </section>

      </main>

      {/* --- Footer --- */}
      <Footer />
    </div>
  );
}
