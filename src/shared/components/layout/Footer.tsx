// ## Footer Component ##
// File: app/components/Footer.tsx
// Description: Reusable Footer component for the TechGetAfrica website.
'use client'
import React from 'react'; // Import React
import Link from 'next/link'; // Import Next.js Link
import { Briefcase, Rocket, BookOpen, Calendar, Users, LifeBuoy, Handshake, LucideProps, Code } from 'lucide-react'; // Icons needed for Footer
import { ForwardRefExoticComponent, RefAttributes } from 'react'; // Import types for icon component

// Define the type for a single footer link item
type FooterLinkItem = {
  name: string;
  href: string;
  // Make the icon optional using '?' and define its complex type
  icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
};

// Define the type for a footer link section
type FooterLinkSection = {
  title: string;
  links: FooterLinkItem[];
};

// Define the Footer component
const Footer = () => {
  // Get the current year for the copyright notice
  const currentYear = new Date().getFullYear();

  // Define the structure and content of the footer links
  const footerLinks: FooterLinkSection[] = [
    {
      title: 'Explore',
      links: [
        { name: 'Accreditation', href: '/accreditation', icon: Briefcase },
        { name: 'Accelerator Program', href: '/programs/accelarator', icon: Rocket },
        { name: 'Consulting', href: '/consulting', icon: Handshake },
        { name: 'Development', href: '/development', icon: Code },
        { name: 'Recruitment Agency Platform', href: '/recruitment', icon: Briefcase },
        { name: 'Resources', href: '/resources', icon: BookOpen },
      ],
    },
    {
      title: 'Connect',
      links: [
        { name: 'Events', href: '/events', icon: Calendar },
        { name: 'Webinars', href: '/webinars', icon: Calendar }, // Using Calendar again, consider a different one if available
        { name: 'Community', href: '/communities', icon: Users },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/support', icon: LifeBuoy },
        { name: 'Become a Partner', href: '/partners/join', icon: Handshake },
        { name: 'Contact Us', href: '/contact', icon: LifeBuoy }, // Example Contact link
      ],
    },
     {
      title: 'Company', // Example section - links here don't have icons
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Blog', href: '/blog' },
      ],
    },
  ];

  // Return the JSX structure of the footer
  return (
    <footer className="bg-black text-gray-300">
      {/* Container for centering and padding */}
      <div className="container mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        {/* Grid layout for larger screens */}
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Column 1: Logo and Description */}
          <div className="space-y-8 xl:col-span-1">
             {/* Site Logo/Name */}
             <Link href="/" className="text-2xl font-bold text-red-600">
               TechGet<span className="text-white">Africa</span>
             </Link>
            {/* Short Description */}
            <p className="text-gray-400 text-base">
              Empowering Africa's tech talent with globally recognized accreditation and career opportunities.
            </p>
            {/* Optional: Placeholder for social media icons */}
            <div className="flex space-x-6">
              {/* Example: <a href="#" className="text-gray-400 hover:text-gray-300"><span className="sr-only">Facebook</span><svg>...</svg></a> */}
            </div>
          </div>

          {/* Column 2 & 3: Footer Links (spans 2 columns on xl screens) */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Map through each section in footerLinks */}
            {footerLinks.map((section) => (
              <div key={section.title}>
                {/* Section Title */}
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
                  {section.title}
                </h3>
                {/* List of Links in the Section */}
                <ul role="list" className="mt-4 space-y-4">
                  {/* Map through each link item in the section */}
                  {section.links.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-base text-gray-400 hover:text-white flex items-center group">
                        {/* Conditionally render the icon only if it exists */}
                        {item.icon && <item.icon className="h-4 w-4 mr-2 text-gray-500 group-hover:text-red-400 transition-colors" aria-hidden="true" />}
                        {/* Link Text */}
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Copyright and Legal Links */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          {/* Copyright Notice */}
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {currentYear} TechGetAfrica. All rights reserved.
          </p>
           {/* Optional: Legal Links */}
           <div className="mt-4 flex justify-center space-x-4">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white">Privacy Policy</Link>
              <span className="text-gray-500">|</span>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white">Terms of Service</Link>
           </div>
        </div>
      </div>
    </footer>
  );
};

// Export the Footer component to be used in other files
export default Footer;
