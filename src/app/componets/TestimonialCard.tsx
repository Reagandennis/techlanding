    // File: app/components/TestimonialCard.tsx
    // Description: Reusable component to display a single testimonial.

    import React from 'react';
    import Image from 'next/image'; // Use Next.js Image

    // Define the props for the TestimonialCard component
    export interface TestimonialCardProps {
      id: number | string;
      quote: string;
      author: string;
      role: string;
      company?: string; // Optional company name
      imageSrc?: string; // Optional author image URL
      location?: string; // Optional location
    }

    const TestimonialCard: React.FC<TestimonialCardProps> = ({
      quote,
      author,
      role,
      company,
      imageSrc,
      location
    }) => {
      return (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-100 h-full flex flex-col">
          {/* Quote Icon */}
          <svg className="h-8 w-8 text-red-200 mb-4 flex-shrink-0" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>

          {/* Quote Text */}
          <blockquote className="flex-grow">
            <p className="text-gray-700 italic">"{quote}"</p>
          </blockquote>

          {/* Author Info */}
          <figcaption className="flex items-center mt-6 flex-shrink-0">
            <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
              {/* Use Next/Image for author image */}
              <Image
                // Provide a fallback if imageSrc is not available
                src={imageSrc || `https://placehold.co/100x100/e2e8f0/4a5568?text=${author.charAt(0)}`}
                alt={`Photo of ${author}`}
                width={48}
                height={48}
                className="object-cover" // Ensure image covers the area
                unoptimized={!imageSrc || imageSrc.startsWith('https://placehold.co')} // Don't optimize placeholders
              />
            </div>
            <div className="ml-4">
              <cite className="text-sm font-semibold text-gray-900 not-italic">{author}</cite>
              <p className="text-xs text-gray-500">
                {role} {company && `, ${company}`}
              </p>
              {location && <p className="text-xs text-gray-500">{location}</p>}
            </div>
          </figcaption>
        </div>
      );
    };

    export default TestimonialCard;

    