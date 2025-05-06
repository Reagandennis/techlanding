'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Calendar, User, Clock, Tag, Search } from 'lucide-react';
import Button from '../componets/Button';
import SectionHeading from '../componets/SectionHeading';
import Footer from '../componets/Footer';
import Navbar from '../componets/Navbar';

const featuredPosts = [
  {
    id: 1,
    title: "The Future of Cloud Computing in Africa",
    excerpt: "How African businesses are leveraging cloud technologies to drive innovation and growth.",
    category: "Technology",
    date: "May 15, 2023",
    readTime: "8 min read",
    author: "Amina Okafor",
    image: "/images/blog/cloud-computing.jpg"
  },
  {
    id: 2,
    title: "5 Essential Certifications for African Tech Professionals in 2023",
    excerpt: "The most valuable certifications that can boost your tech career this year.",
    category: "Career",
    date: "April 28, 2023",
    readTime: "6 min read",
    author: "David Mensah",
    image: "/images/blog/certifications.jpg"
  },
  {
    id: 3,
    title: "Building Inclusive Tech Communities Across Africa",
    excerpt: "Strategies for creating more diverse and welcoming tech ecosystems.",
    category: "Community",
    date: "April 10, 2023",
    readTime: "10 min read",
    author: "Ngozi Eze",
    image: "/images/blog/community.jpg"
  }
];

const popularCategories = [
  { name: "Technology", count: 28 },
  { name: "Career Growth", count: 22 },
  { name: "Certifications", count: 18 },
  { name: "Startups", count: 15 },
  { name: "Learning Tips", count: 12 }
];

const recentPosts = [
  {
    title: "How to Transition into a Tech Career Without a Degree",
    date: "May 5, 2023",
    readTime: "7 min read"
  },
  {
    title: "The Rise of Fintech in East Africa",
    date: "April 30, 2023",
    readTime: "9 min read"
  },
  {
    title: "Interview Tips for Remote Tech Jobs",
    date: "April 22, 2023",
    readTime: "5 min read"
  },
  {
    title: "Essential Soft Skills for Tech Professionals",
    date: "April 18, 2023",
    readTime: "6 min read"
  }
];

export default function BlogPage() {
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
                Insights & Knowledge
              </span>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">TechGetAfrica</span>
                <span className="block text-red-600">Blog</span>
              </h1>
              <p className="mt-5 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-7 md:text-xl md:max-w-3xl">
                Expert insights, career advice, and industry trends for Africa's tech professionals.
              </p>
              
              <div className="mt-12 max-w-2xl mx-auto relative">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-r-lg transition-colors">
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Featured Content"
              title="Latest Articles"
              description="Discover our most recent and popular blog posts"
              alignment="left"
            />
            
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <article key={post.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="h-48 bg-gray-200 relative">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="inline-flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        {post.category}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="inline-flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {post.date}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      <Link href={`/blog/${post.id}`} className="hover:text-red-600 transition-colors">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        {post.author}
                      </span>
                      <span className="inline-flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button href="/blog" variant="outline">
                View All Articles
              </Button>
            </div>
          </div>
        </section>

        {/* Blog Content Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:flex gap-12">
              {/* Main Content */}
              <div className="lg:w-2/3">
                <SectionHeading
                  eyebrow="Tech Insights"
                  title="Popular Topics"
                  description="Explore our most read articles across key categories"
                  alignment="left"
                />
                
                {/* Article List */}
                <div className="mt-12 space-y-12">
                  {/* Article 1 */}
                  <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                    <div className="md:flex">
                      <div className="md:w-1/3 mb-6 md:mb-0">
                        <div className="h-full bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src="/images/blog/ai-africa.jpg"
                            alt="AI in Africa"
                            width={400}
                            height={300}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                      <div className="md:w-2/3 md:pl-6">
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <span className="inline-flex items-center">
                            <Tag className="h-4 w-4 mr-1" />
                            Technology
                          </span>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            April 5, 2023
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                          <Link href="/blog/ai-in-africa" className="hover:text-red-600 transition-colors">
                            The State of AI Adoption in African Enterprises
                          </Link>
                        </h2>
                        <p className="text-gray-600 mb-4">
                          How African businesses are implementing artificial intelligence solutions to solve local challenges and drive innovation.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center text-sm text-gray-500">
                            <User className="h-4 w-4 mr-1" />
                            Kwame Asante
                          </span>
                          <span className="inline-flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            12 min read
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                  
                  {/* Article 2 */}
                  <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                    <div className="md:flex">
                      <div className="md:w-1/3 mb-6 md:mb-0">
                        <div className="h-full bg-gray-200 rounded-lg overflow-hidden">
                          <Image
                            src="/images/blog/remote-work.jpg"
                            alt="Remote work in Africa"
                            width={400}
                            height={300}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                      <div className="md:w-2/3 md:pl-6">
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <span className="inline-flex items-center">
                            <Tag className="h-4 w-4 mr-1" />
                            Career Growth
                          </span>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            March 28, 2023
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                          <Link href="/blog/remote-work" className="hover:text-red-600 transition-colors">
                            Mastering Remote Work: Tips for African Tech Professionals
                          </Link>
                        </h2>
                        <p className="text-gray-600 mb-4">
                          Practical strategies for succeeding in remote tech roles while navigating Africa's unique infrastructure challenges.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center text-sm text-gray-500">
                            <User className="h-4 w-4 mr-1" />
                            Fatoumata Diallo
                          </span>
                          <span className="inline-flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            9 min read
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
                
                {/* Pagination */}
                <div className="mt-12 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
                      Previous
                    </button>
                    <button className="px-3 py-1 rounded bg-red-600 text-white">
                      1
                    </button>
                    <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                      2
                    </button>
                    <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                      3
                    </button>
                    <span className="px-2 text-gray-500">...</span>
                    <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                      8
                    </button>
                    <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50">
                      Next
                    </button>
                  </nav>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:w-1/3 mt-12 lg:mt-0">
                {/* Categories */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="h-5 w-5 text-red-600 mr-2" />
                    Categories
                  </h3>
                  <ul className="space-y-3">
                    {popularCategories.map((category, index) => (
                      <li key={index}>
                        <Link href={`/blog/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`} className="flex justify-between items-center text-gray-700 hover:text-red-600 transition-colors">
                          <span>{category.name}</span>
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {category.count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Recent Posts */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 text-red-600 mr-2" />
                    Recent Posts
                  </h3>
                  <ul className="space-y-4">
                    {recentPosts.map((post, index) => (
                      <li key={index}>
                        <Link href={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-')}`} className="group">
                          <h4 className="text-gray-900 group-hover:text-red-600 transition-colors mb-1">
                            {post.title}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {post.date}
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4 mr-1" />
                            {post.readTime}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Newsletter */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 text-red-600 mr-2" />
                    Newsletter
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Get the latest tech insights and career advice delivered to your inbox.
                  </p>
                  <form className="space-y-3">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                    <Button variant="primary" className="w-full" href={''}>
                      Subscribe
                    </Button>
                  </form>
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
                Want to Contribute to Our Blog?
              </h2>
              <p className="mt-5 max-w-2xl mx-auto text-lg text-red-100">
                We're always looking for industry experts to share their knowledge with Africa's tech community.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button href="/write-for-us" variant="outline">
                  Write for Us
                </Button>
                <Button href="/contact" variant="outline">
                  Contact Our Editors
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