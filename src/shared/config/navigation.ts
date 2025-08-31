import { Award, Users, Briefcase, Code } from 'lucide-react';
import { NavigationConfig, NavigationItem, BusinessVertical } from '../types/business';

class NavigationConfigManager {
  private config: Record<string, NavigationConfig> = {
    default: {
      primary: [
        { label: 'About', href: '/about' },
        { label: 'Partners', href: '/partners' },
        { label: 'Resources', href: '/resources' },
      ],
      secondary: [
        { label: 'Blog', href: '/blog' },
        { label: 'Support', href: '/support' },
        { label: 'Contact', href: '/contact' },
      ],
      verticals: [
        { 
          label: 'Education & Certifications', 
          href: '/certifications',
          description: 'Earn globally recognized tech certifications',
          icon: Award 
        },
        { 
          label: 'Recruitment Services', 
          href: '/recruitment',
          description: 'Connect with certified African tech talent',
          icon: Users 
        },
        { 
          label: 'Technology Consulting', 
          href: '/consulting',
          description: 'Strategic guidance for your tech journey',
          icon: Briefcase 
        },
        { 
          label: 'Software Development', 
          href: '/development',
          description: 'Custom software solutions',
          icon: Code 
        },
      ]
    },
    education: {
      primary: [
        { label: 'Certifications', href: '/certifications' },
        { label: 'Programs', href: '/programs' },
        { label: 'Accreditation', href: '/accreditation' },
        { label: 'Courses', href: '/courses' },
      ],
      secondary: [
        { label: 'My Progress', href: '/dashboard' },
        { label: 'Community', href: '/communities' },
        { label: 'Resources', href: '/resources' },
      ],
      verticals: []
    },
    recruitment: {
      primary: [
        { label: 'For Employers', href: '/recruitment' },
        { label: 'Talent Pool', href: '/recruitment/talent-pool' },
        { label: 'Success Stories', href: '/recruitment/success-stories' },
      ],
      secondary: [
        { label: 'Post a Job', href: '/recruitment/post-job' },
        { label: 'Pricing', href: '/recruitment/pricing' },
      ],
      verticals: []
    },
    consulting: {
      primary: [
        { label: 'For Freelancers', href: '/consulting/freelancers' },
        { label: 'For Startups', href: '/consulting/startups' },
        { label: 'For Enterprise', href: '/consulting/enterprise' },
        { label: 'Case Studies', href: '/consulting/case-studies' },
      ],
      secondary: [
        { label: 'Book Consultation', href: '/consulting#contact' },
        { label: 'Our Process', href: '/consulting#process' },
      ],
      verticals: []
    },
    development: {
      primary: [
        { label: 'Web Development', href: '/development/web' },
        { label: 'Mobile Apps', href: '/development/mobile' },
        { label: 'Custom Software', href: '/development/custom' },
        { label: 'Portfolio', href: '/development/portfolio' },
      ],
      secondary: [
        { label: 'Start Project', href: '/development#contact' },
        { label: 'Tech Stack', href: '/development/tech-stack' },
      ],
      verticals: []
    }
  };
  
  getMenuItems(vertical?: BusinessVertical | string): NavigationConfig {
    return this.config[vertical || 'default'] || this.config.default;
  }

  getVerticalNavigation(): NavigationItem[] {
    return this.config.default.verticals;
  }
}

export const navigationConfig = new NavigationConfigManager();
