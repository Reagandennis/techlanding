import { Award, Users, Briefcase, Code } from 'lucide-react';
import { Button } from '../ui/Button';
import { SectionHeading } from '../common/SectionHeading';

const businessVerticals = [
  {
    id: 'education',
    title: 'Tech Education & Certifications',
    description: 'Earn globally recognized certifications from AWS, Microsoft, CompTIA, and more.',
    icon: <Award className="h-8 w-8 text-red-600" />,
    href: '/certifications',
    cta: 'Browse Certifications',
    features: ['Industry Accreditation', 'Hands-on Labs', 'Career Support']
  },
  {
    id: 'recruitment',
    title: 'Recruitment Services',
    description: 'Connect with certified tech talent across Africa or find your next opportunity.',
    icon: <Users className="h-8 w-8 text-red-600" />,
    href: '/recruitment',
    cta: 'Find Talent',
    features: ['Pre-vetted Candidates', 'Skills Matching', 'Pan-African Reach']
  },
  {
    id: 'consulting',
    title: 'Technology Consulting',
    description: 'Strategic guidance for freelancers, startups, and enterprises.',
    icon: <Briefcase className="h-8 w-8 text-red-600" />,
    href: '/consulting',
    cta: 'Get Consultation',
    features: ['Digital Transformation', 'Process Automation', 'Expert Mentorship']
  },
  {
    id: 'development',
    title: 'Software Development',
    description: 'Custom software solutions from web apps to enterprise systems.',
    icon: <Code className="h-8 w-8 text-red-600" />,
    href: '/development',
    cta: 'Start Project',
    features: ['Full-Stack Development', 'Mobile Apps', 'Cloud Architecture']
  }
];

export function BusinessVerticalCards() {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="services-heading">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Services"
          title="Choose Your Path to Success"
          description="TechGetAfrica offers comprehensive solutions across four key areas of technology growth."
          id="services-heading"
        />
        
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {businessVerticals.map((vertical) => (
            <div
              key={vertical.id}
              className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:border-red-200 transition-all hover:shadow-lg transform hover:-translate-y-1"
            >
              <div className="flex-shrink-0">
                <div className="bg-red-100 rounded-lg p-3 inline-flex">
                  {vertical.icon}
                </div>
              </div>
              
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {vertical.title}
              </h3>
              
              <p className="mt-2 text-base text-gray-500">
                {vertical.description}
              </p>
              
              <ul className="mt-4 space-y-2">
                {vertical.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm text-gray-500">
                    <span className="mr-2 text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="mt-6">
                <Button href={vertical.href} variant="primary" className="w-full">
                  {vertical.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
