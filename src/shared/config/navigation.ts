import { Award, Users, Briefcase, Code, Book, GraduationCap } from 'lucide-react';

// Main navigation structure - Education first, then other services
export const MAIN_NAVIGATION = {
  // Primary focus - Education & Certifications
  primary: [
    { 
      label: 'Programs', 
      href: '/programs',
      description: 'Certification programs and accelerators'
    },
    { 
      label: 'Courses', 
      href: '/courses',
      description: 'Browse our course catalog'
    },
    { 
      label: 'Accreditation', 
      href: '/accreditation',
      description: 'Global certification partners'
    },
  ],
  // Secondary navigation
  secondary: [
    { label: 'About', href: '/about' },
    { label: 'Community', href: '/communities' },
    { label: 'Resources', href: '/resources' },
    { label: 'Support', href: '/support' },
  ],
  // Other business services (less prominent)
  services: [
    { 
      label: 'Consulting', 
      href: '/consulting',
      description: 'Strategic tech guidance',
      icon: Briefcase 
    },
    { 
      label: 'Development', 
      href: '/development',
      description: 'Custom software solutions',
      icon: Code 
    },
    { 
      label: 'Recruitment', 
      href: '/recruitment',
      description: 'Connect with African tech talent',
      icon: Users 
    },
  ],
  // LMS specific navigation (for authenticated users)
  lms: [
    { label: 'Student Dashboard', href: '/lms/student' },
    { label: 'Instructor Dashboard', href: '/lms/instructor' },
    { label: 'Admin Dashboard', href: '/lms/admin' },
  ]
};

