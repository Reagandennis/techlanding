import { FC } from 'react';
import { Metadata } from 'next';
import { Briefcase, Zap, Building, CheckCircle, Mail, Phone } from 'lucide-react';

import Navbar from '../componets/Navbar';
import Footer from '../componets/Footer';
import SectionHeading from '../componets/SectionHeading';
import Button from '../componets/Button';
import ContactForm from './ContactForm'; // I will create this component next.

export const metadata: Metadata = {
  title: 'Consulting Services | TechGetAfrica',
  description: 'Expert consulting for freelancers, startups, and businesses to accelerate growth, drive innovation, and achieve strategic goals in the tech landscape.',
};

const services = [
  {
    icon: <Briefcase className="h-8 w-8 text-red-600" />,
    title: 'For Freelancers',
    description: 'Amplify your personal brand and scale your freelance business with targeted strategies for client acquisition, project management, and financial planning.',
    features: [
      'Portfolio & Brand Development',
      'Client Outreach & Negotiation',
      'Financial Management & Tooling',
    ],
  },
  {
    icon: <Zap className="h-8 w-8 text-red-600" />,
    title: 'For Startups',
    description: 'Navigate the startup ecosystem with expert guidance on product-market fit, fundraising, and scaling your operations for sustainable growth.',
    features: [
      'MVP & Product Strategy',
      'Investor Readiness & Pitching',
      'Agile Team Structuring',
    ],
  },
  {
    icon: <Building className="h-8 w-8 text-red-600" />,
    title: 'For Businesses',
    description: 'Drive digital transformation and gain a competitive edge with our solutions for process automation, data strategy, and technology adoption.',
    features: [
      'Digital Transformation Roadmap',
      'Workflow Automation & AI Integration',
      'Corporate Tech Training',
    ],
  },
];

const processSteps = [
  { name: 'Discovery Call', description: 'We start with a free consultation to understand your challenges and goals.' },
  { name: 'Strategy & Proposal', description: 'We craft a tailored strategy and a detailed proposal for your review.' },
  { name: 'Implementation', description: 'Our experts work with your team to execute the plan with precision.' },
  { name: 'Review & Scale', description: 'We analyze the results and provide guidance for continuous improvement.' },
];

const ConsultingPage: FC = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <Navbar />
      </header>

      <main className="flex-grow">
        {/* --- Hero Section --- */}
        <section className="relative bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8 overflow-hidden">
          <div className="relative container mx-auto max-w-7xl text-center">
            <span className="inline-block px-4 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full mb-4">
              Strategic Tech Guidance
            </span>
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline">Expert Consulting</span>{' '}
              <span className="block text-red-600 xl:inline">to Accelerate Your Growth</span>
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500 sm:text-xl md:mt-5">
              From individual freelancers to established enterprises, we provide the strategic insights and technical expertise needed to thrive in the digital age.
            </p>
            <div className="mt-8">
              <Button href="#contact" variant="primary" size="lg">
                Book a Free Consultation
              </Button>
            </div>
          </div>
        </section>

        {/* --- Services Section --- */}
        <section className="bg-white py-16 sm:py-20" aria-labelledby="services-heading">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Who We Help"
              title="Tailored Solutions for Every Scale"
              description="We understand that different businesses have unique needs. Our consulting services are designed to deliver targeted value, no matter your size."
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

        {/* --- Our Process Section --- */}
        <section className="bg-gray-50 py-16 sm:py-20" aria-labelledby="process-heading">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="How It Works"
              title="A Clear Path to Success"
              description="Our streamlined process ensures transparency, collaboration, and measurable results at every stage of our partnership."
              id="process-heading"
            />
            <div className="mt-12">
              <div className="relative">
                {/* Dotted line */}
                <div className="absolute left-1/2 -ml-px w-px bg-gray-300 h-full" aria-hidden="true"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {processSteps.map((step, index) => (
                    <div key={step.name} className={`relative flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className={`px-6 flex-1 ${index % 2 === 0 ? 'text-left' : 'md:text-right'}`}>
                        <h3 className="text-lg font-semibold text-gray-900">{step.name}</h3>
                        <p className="mt-1 text-gray-500">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                  eyebrow="Let's Connect"
                  title="Ready to Build the Future?"
                  description="Fill out the form to schedule your complimentary consultation. Let's discuss your challenges and how TechGetAfrica can help you achieve your strategic objectives."
                  id="contact-heading"
                  alignment="left"
                />
                <div className="mt-8 space-y-4">
                  <a href="mailto:consulting@techgetafrica.com" className="flex items-center text-gray-700 hover:text-red-600">
                    <Mail className="h-5 w-5 mr-3" />
                    <span>consulting@techgetafrica.com</span>
                  </a>
                  <a href="tel:+254123456789" className="flex items-center text-gray-700 hover:text-red-600">
                    <Phone className="h-5 w-5 mr-3" />
                    <span>+254 123 456 789 (Mon-Fri, 9am-5pm)</span>
                  </a>
                </div>
              </div>
              {/* Form */}
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Schedule Your Free Consultation</h3>
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

export default ConsultingPage;