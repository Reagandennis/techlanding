
import { FC } from 'react';
import { Metadata } from 'next';
import { Code, Layers, Smartphone, CheckCircle, Mail, Phone } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionHeading from '@/components/SectionHeading';
import Button from '@/components/Button';
import ContactForm from './ContactForm'; // I will create this component next.

export const metadata: Metadata = {
  title: 'Software Development Services | TechGetAfrica',
  description: 'Custom software development services for startups and enterprises. We build scalable web and mobile applications, from simple prototypes to complex, enterprise-grade systems.',
};

const services = [
  {
    icon: <Layers className="h-8 w-8 text-red-600" />,
    title: 'Web Applications',
    description: 'From dynamic single-page applications to large-scale enterprise platforms, we build responsive, secure, and scalable web solutions.',
    features: [
      'React/Next.js Development',
      'API Design & Integration',
      'Cloud-Native Architecture',
    ],
  },
  {
    icon: <Smartphone className="h-8 w-8 text-red-600" />,
    title: 'Mobile Applications',
    description: 'Engage your users with beautiful and intuitive mobile apps for iOS and Android, built with performance and user experience in mind.',
    features: [
      'Native & Cross-Platform',
      'User-Centric UI/UX Design',
      'App Store Deployment',
    ],
  },
  {
    icon: <Code className="h-8 w-8 text-red-600" />,
    title: 'Custom Software',
    description: 'We design and build bespoke software solutions tailored to your unique business processes and challenges, driving efficiency and innovation.',
    features: [
      'Business Process Automation',
      'Third-Party System Integration',
      'Ongoing Support & Maintenance',
    ],
  },
];

const techStack = ['React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'Django', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS'];

const DevelopmentPage: FC = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      

      <main className="flex-grow">
        {/* --- Hero Section --- */}
        <section className="relative bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8 overflow-hidden">
          <div className="relative container mx-auto max-w-7xl text-center">
            <span className="inline-block px-4 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full mb-4">
              Full-Stack Development
            </span>
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline">From Idea to</span>{' '}
              <span className="block text-red-600 xl:inline">Production-Ready Software</span>
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500 sm:text-xl md:mt-5">
              We partner with businesses of all sizes to design, build, and scale exceptional software solutions that drive results.
            </p>
            <div className="mt-8">
              <Button href="#contact" variant="primary" size="lg">
                Start Your Project
              </Button>
            </div>
          </div>
        </section>

        {/* --- Services Section --- */}
        <section className="bg-white py-16 sm:py-20" aria-labelledby="services-heading">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="What We Build"
              title="Tailored Software for Your Needs"
              description="Our expertise spans the entire development lifecycle, from initial concept and design to deployment and ongoing support."
              id="services-heading"
            />
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div key={service.title} className="bg-gray-50 rounded-lg shadow-md p-6 flex flex-col border border-gray-100 hover:border-red-200 transition-all hover:shadow-lg transform hover:-translate-y-1">
                  <div className="flex-shrink-0">
                    <div className="bg-red-100 rounded-lg p-3 inline-flex">
                      {service.icon}
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">{service.title}</h3>
                  <p className="mt-2 text-base text-gray-500 flex-grow">{service.description}</p>
                  <ul className="mt-6 space-y-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Tech Stack Section --- */}
        <section className="bg-gray-50 py-16 sm:py-20" aria-labelledby="tech-stack-heading">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Technology"
              title="Leveraging Modern, Proven Technologies"
              description="We use a curated set of modern technologies to build reliable, scalable, and maintainable software applications."
              id="tech-stack-heading"
            />
            <div className="mt-12 flex flex-wrap justify-center items-center gap-4">
              {techStack.map((tech) => (
                <div key={tech} className="bg-white rounded-full px-4 py-2 text-gray-700 font-medium shadow-sm border border-gray-200">
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Contact & CTA Section --- */}
        <section id="contact" className="bg-white py-16 sm:py-20" aria-labelledby="contact-heading">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 rounded-2xl p-8 md:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div>
                <SectionHeading
                  eyebrow="Let's Build Together"
                  title="Have a Project in Mind?"
                  description="We're ready to partner with you to bring your vision to life. Fill out the form to get in touch with our development team."
                  id="contact-heading"
                  alignment="left"
                />
                <div className="mt-8 space-y-4">
                  <a href="mailto:development@techgetafrica.com" className="flex items-center text-gray-700 hover:text-red-600">
                    <Mail className="h-5 w-5 mr-3" />
                    <span>development@techgetafrica.com</span>
                  </a>
                  <a href="tel:+254123456789" className="flex items-center text-gray-700 hover:text-red-600">
                    <Phone className="h-5 w-5 mr-3" />
                    <span>+254 123 456 789 (Mon-Fri, 9am-5pm)</span>
                  </a>
                </div>
              </div>
              {/* Form */}
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Tell Us About Your Project</h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DevelopmentPage;
