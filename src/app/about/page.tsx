'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Target, Users, Globe, Award, Rocket, Heart, MapPin } from 'lucide-react';
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import Footer from '../componets/Footer';
import Navbar from '../componets/Navbar';

const missionPoints = [
  {
    icon: <Target className="h-8 w-8 text-red-600" />,
    title: "Our Mission",
    description: "To empower African tech professionals with globally recognized skills and certifications, creating pathways to rewarding careers in the global tech ecosystem."
  },
  {
    icon: <Users className="h-8 w-8 text-red-600" />,
    title: "Our Community",
    description: "Building a supportive network of African tech professionals, mentors, industry leaders, and learning communities across the continent."
  },
  {
    icon: <Globe className="h-8 w-8 text-red-600" />,
    title: "Our Reach",
    description: "Connecting African talent with global opportunities through partnerships with leading tech companies and educational institutions worldwide."
  }
];

const values = [
  {
    icon: <Award className="h-8 w-8 text-red-600" />,
    title: "Excellence",
    description: "Committed to delivering high-quality tech education and certification programs that meet international standards and prepare professionals for real-world challenges."
  },
  {
    icon: <Rocket className="h-8 w-8 text-red-600" />,
    title: "Innovation",
    description: "Continuously evolving our teaching methods, curriculum, and technology platforms to stay ahead of industry trends and provide cutting-edge learning experiences."
  },
  {
    icon: <Heart className="h-8 w-8 text-red-600" />,
    title: "Inclusivity",
    description: "Making tech education accessible to all African professionals regardless of background, location, or prior experience through scholarships, flexible payment options, and localized content."
  }
];

const milestones = [
  {
    year: "2023",
    title: "Foundation",
    description: "TechGetAfrica was founded in Nairobi with a mission to make global tech certifications accessible across Africa."
  },
  {
    year: "2024",
    title: "First Partnerships",
    description: "Established official partnerships with AWS, Microsoft, and CompTIA to offer accredited certification programs."
  },
  {
    year: "2025",
    title: "Digital Expansion",
    description: "Launched our digital learning platform to reach tech professionals across all 54 African countries across the continet."
  },
  {
    year: "2026",
    title: "Scholarship Program (Future Goal)",
    description: "Planning to initiate the 'Tech Futures Fund' providing 500 scholarships to promising tech talent from underserved communities."
  },
  {
    year: "2026",
    title: "Corporate Training (Expansion)",
    description: "Expanded into corporate training programs, helping African businesses upskill their technical teams."
  },
  {
    year: "2027",
    title: "Pan-African Presence (Africa Expansion)",
    description: "Set up physical learning hubs in 12 major African cities with state-of-the-art facilities."
  },
  {
    year: "2028 (Grand Graduation)",
    title: "5,000th Graduate",
    description: "We plan to celebrate our 5,000th certified graduate, with 76% reporting significant career advancement."
  },
  {
    year: "2029",
    title: "Global Recognition (Company vision)",
    description: "Recognized as Africa's leading tech certification provider by the International Association of IT Educators."
  },
    {
        year: "2030",
        title: "Future Vision",
        description: "Aiming to empower 100,000 African tech professionals with globally recognized certifications by 2035."
    },
];

const teamMembers = [
  {
    name: "Reagan Enoch Owiti",
    role: "Founder & CEO",
    bio: "Former Senior software engineer with a deep understanding in Computer Science. Passionate about democratizing tech education across Africa.",
    image: "/images/reagan.png"
  },
  {
    name: "Ibrahim Keita",
    role: "Chief Academic Officer",
    bio: "20+ years experience in tech education and curriculum development. Previously led certification programs at Microsoft Africa.",
    image: "/images/team/ibrahim-keita.jpg"
  },
  {
    name: "Nala Mandela",
    role: "Director of Partnerships",
    bio: "Expert in building corporate and institutional relationships that create opportunities for African tech professionals.",
    image: "/images/team/nala-mandela.jpg"
  },
  {
    name: "David Osei",
    role: "Chief Technology Officer",
    bio: "Cloud architecture specialist with extensive experience designing learning platforms that function effectively across variable infrastructure.",
    image: "/images/team/david-osei.jpg"
  }
];

const impactStats = [
  { figure: "32", label: "African countries with active students" },
  { figure: "5,000+", label: "Certified graduates" },
  { figure: "76%", label: "Employment rate post-certification" },
  { figure: "150%", label: "Average salary increase" },
];

const locations = [
  { city: "Nairobi", country: "Kenya KE", address: "Lower Kabete, Kingeero" },
  { city: "Lagos", country: "Nigeria", address: "Victoria Island Tech Hub, Adeola Odeku Street" },
  { city: "Accra", country: "Ghana", address: "Airport Residential Area, Innovation Place" },
  { city: "Cairo", country: "Egypt", address: "Smart Village, Building B4" },
  { city: "Johannesburg", country: "South Africa", address: "Sandton City, Katherine Street" },
  { city: "Kigali", country: "Rwanda", address: "Kigali Innovation City, Block 3" }
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-50">
      <Navbar />
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white pt-20 pb-24 px-4 sm:px-6 lg:pt-28 lg:pb-32 lg:px-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <div className="absolute right-0 bottom-0 w-1/3 h-1/3 bg-red-50 rounded-tl-3xl opacity-70"></div>
            <div className="absolute left-0 top-0 w-1/4 h-1/4 bg-gray-100 rounded-br-3xl"></div>
          </div>
          
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center">
              <span className="inline-block px-4 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full mb-4">
                Our Journey
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Building Africa's</span>
                <span className="block text-red-600">Tech Future</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                From a small startup in Nairobi to the continent's leading tech education platform — discover how TechGetAfrica is empowering the next generation of African tech professionals.
              </p>
              
              {/* Video Thumbnail */}
              <div className="mt-12 mx-auto max-w-3xl relative rounded-xl overflow-hidden shadow-xl">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <Image 
                    src="/placeholder.jpg" 
                    alt="About TechGetAfrica"
                    width={1200}
                    height={675}
                    className="object-cover w-full h-full"
                  />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-red-600 bg-opacity-90 p-4 hover:bg-opacity-100 transition-all cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black to-transparent p-6">
                  <p className="text-white font-medium">Watch our story: Empowering Africa's Tech Talent</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Purpose & Vision"
              title="Why We Exist"
              description="Our driving purpose is to unlock Africa's vast technology potential by providing accessible, world-class tech education."
              alignment="center"
            />
            
            <div className="mt-16 grid gap-10 md:grid-cols-3">
              {missionPoints.map((point, index) => (
                <div key={index} className="text-center bg-gray-50 rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="mx-auto inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                    {point.icon}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">{point.title}</h3>
                  <p className="mt-4 text-gray-600 leading-relaxed">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Impact Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Impact"
              title="Transforming Africa's Tech Landscape"
              description="Through education, mentorship, and community building, we're fostering a new generation of African tech innovators."
              alignment="center"
            />
            
            <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
              {impactStats.map((stat, index) => (
                <div key={index} className="text-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="text-3xl font-bold text-red-600 mb-2">{stat.figure}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
            
            {/* Featured Success Story */}
            <div className="mt-16 bg-white rounded-xl overflow-hidden shadow-md">
              <div className="md:flex">
                <div className="md:w-1/3 bg-gray-200">
                  <div className="h-full relative">
                    <Image 
                      src="/placeholder.jpg" 
                      alt="Success Story - Ngozi Okonkwo"
                      width={600}
                      height={800}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="md:w-2/3 p-6 md:p-10">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full mb-4">
                    Featured Success Story
                  </span>
                  <blockquote className="italic text-lg text-gray-600 mb-6">
                    "Before joining TechGetAfrica, I struggled to break into the tech industry despite my computer science degree. The AWS certification program gave me practical cloud skills that employers actually valued. Within weeks of certification, I received three job offers with salary packages I never thought possible."
                  </blockquote>
                  <div className="flex items-center">
                    <div>
                      <div className="font-semibold text-gray-900">Ngozi Okonkwo</div>
                      <div className="text-sm text-gray-500">AWS Certified Solutions Architect</div>
                      <div className="text-sm text-gray-500">Now: Senior Cloud Engineer at Flutterwave</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button href="/success-stories" variant="outline">
                      Read More Success Stories
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* History/Timeline Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Journey"
              title="From Vision to Reality"
              description="The story of our growth and impact across the African continent"
              alignment="center"
            />
            
            <div className="mt-16 relative">
              {/* Vertical Line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-200" aria-hidden="true"></div>
              
              {/* Timeline Items */}
              <div className="space-y-16">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} items-center`}>
                    {/* Year Badge */}
                    <div className="absolute -top-3 md:top-0 left-1/2 md:left-auto md:right-1/2 md:translate-x-1/2 transform -translate-x-1/2 flex items-center justify-center z-10">
                      <div className="rounded-full bg-red-600 text-white px-4 py-1 font-semibold text-sm">
                        {milestone.year}
                      </div>
                    </div>
                    
                    {/* Content Box */}
                    <div className={`mt-8 md:mt-0 md:w-5/12 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
                        <p className="mt-2 text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                    
                    {/* Center Dot */}
                    <div className="hidden md:flex absolute left-1/2 top-0 transform -translate-x-1/2 items-center justify-center">
                      <div className="h-4 w-4 rounded-full bg-red-600 border-4 border-red-100"></div>
                    </div>
                    
                    {/* Empty Space for alignment */}
                    <div className="hidden md:block md:w-5/12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:flex items-center gap-12">
              <div className="lg:w-1/2 mb-10 lg:mb-0">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full mb-4">
                  Our Story
                </span>
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">Bridging the Global Tech Divide</h2>
                
                <div className="prose prose-red max-w-none">
                  <p className="text-gray-600 text-lg mb-6">
                    TechGetAfrica was born from a simple observation: Africa has incredible tech talent, but lacks equitable access to the certification programs and training that global employers recognize and value.
                  </p>
                  
                  <p className="text-gray-600 mb-6">
                    Our founder, Reagan Enoch Owiti, experienced this firsthand as he navigated his own tech career journey from Nairobi to working abroad. Despite his world-class education and skills, he faced constant skepticism about his capabilities due to the lack of industry-recognized credentials on his resume.
                  </p>
                  
                  <p className="text-gray-600 mb-6">
                    In 2023, he returned to Africa with a mission: to create a platform that would provide African tech professionals with the same access to certification programs, mentorship, and job opportunities that their global counterparts enjoy.
                  </p>
                  
                  <p className="text-gray-600">
                    What started as a small bootcamp in Nairobi with just 15 students has grown into the continent's leading tech certification platform, with learning hubs in 12 major African cities and online programs reaching all 54 countries. Our 5,000+ graduates work at top global tech companies, lead innovative African startups, and build technology that impacts millions.
                  </p>
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <div className="rounded-xl overflow-hidden shadow-lg relative">
                  <Image 
                    src="/images/reagan.png" 
                    alt="TechGetAfrica Origin Story"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-6 text-white">
                      <p className="font-medium">Reagan Enoch Owiti launching Techgetafrica in 2023</p>
                    </div>
                  </div>
                </div>
                
                {/* Additional Images */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="rounded-lg overflow-hidden shadow-md">
                    <Image 
                      src="/images/techgetafrica.png" 
                      alt="First AWS Certification Cohort"
                      width={400}
                      height={300}
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-md">
                    <Image 
                      src="/images/main.png" 
                      alt="Kickoff Learning Hub Opening"
                      width={400}
                      height={300}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Team Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Leadership"
              title="Meet the Team"
              description="The passionate minds behind TechGetAfrica's mission to transform tech education in Africa"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md group">
                  <div className="aspect-w-3 aspect-h-4 bg-gray-100 relative">
                    <Image 
                      src={member.image}
                      alt={member.name}
                      width={300}
                      height={400}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                    <p className="text-red-600 text-sm mb-3">{member.role}</p>
                    <p className="text-gray-500 text-sm">{member.bio}</p>
                    
                    {/* Social Media Links */}
                    <div className="mt-4 flex space-x-3">
                      <a href="#" className="text-gray-400 hover:text-red-600">
                        <span className="sr-only">LinkedIn</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-red-600">
                        <span className="sr-only">Twitter</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Advisory Board Teaser */}
            <div className="mt-16 text-center">
              <p className="text-gray-500">Backed by an advisory board of industry leaders from Google, AWS, Microsoft, and leading African tech companies.</p>
              <div className="mt-6">
                <Button href="/team" variant="outline">
                  Meet Our Full Team
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Values"
              title="What Drives Us"
              description="The core principles that guide everything we do"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-10 md:grid-cols-3">
              {values.map((value, index) => (
                <div key={index} className="relative bg-gray-50 rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  {/* Icon Circle */}
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                    {value.icon}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                  
                  {/* Example of value in action */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">In Action:</h4>
                    <p className="text-sm text-gray-500">
                      {value.title === "Excellence" && 
                        "Our AWS certification program has a 92% first-time pass rate, compared to the global average of 76%."}
                      {value.title === "Innovation" && 
                        "We developed a custom low-bandwidth learning platform that works even in areas with limited connectivity."}
                      {value.title === "Inclusivity" && 
                        "Our Talent Hunt program has awarded full scholarships to over 500 promising students from underserved communities."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Locations Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Presence"
              title="Find Us Across Africa"
              description="Physical learning hubs with state-of-the-art facilities and dedicated support teams"
              alignment="center"
            />
            
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((location, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <MapPin className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {location.city}, <span className="text-gray-500">{location.country}</span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{location.address}</p>
                    <Link href={`/locations/${location.city.toLowerCase()}`} className="mt-3 inline-flex items-center text-sm font-medium text-red-600 hover:text-red-700">
                      View location details
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button href="/locations" variant="primary">
                Explore All Locations
              </Button>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Partners"
              title="Trusted By Industry Leaders"
              description="We collaborate with the world's leading technology companies and educational institutions"
              alignment="center"
            />
            
            <div className="mt-16">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
                {/* Partner logos */}
                {[
                  { name: "AWS", logo: "/images/aws.svg" },
                  { name: "Microsoft", logo: "/images/microsoft.png" },
                  { name: "Google Cloud", logo: "/images/google.svg" },
                  { name: "CompTIA", logo: "/images/comptia.svg" },
                  { name: "Cisco", logo: "/images/cisco.png" },
                  { name: "ICS2", logo: "/images/ics2.png" },
                ].map((partner, index) => (
                  <div key={index} className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                    <Image 
                      src={partner.logo}
                      alt={partner.name}
                      width={120}
                      height={60}
                      className="object-contain h-12"
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-12 text-center">
                <Button href="/partners" variant="outline">
                  View All Partnerships
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-red-600 rounded-2xl px-6 py-16 sm:p-16 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Transform Your Tech Career?
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                Join thousands of African tech professionals who've accelerated their careers with globally recognized certifications.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/programs" variant="outline">
                  Explore Programs
                </Button>
                <Button href="/contact" variant="outline">
                  Contact Admissions
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