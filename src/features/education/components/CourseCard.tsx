    // File: app/components/CourseCard.tsx
    // Description: Reusable component to display course information.

    import React from 'react';
    import Image from 'next/image';
    import Link from 'next/link';
    import { Calendar, GraduationCap, ArrowRight, Badge } from 'lucide-react'; // Assuming you might use Badge icon

    // Define and export the props type for the CourseCard component
    export interface CourseCardProps {
      id: string | number;
      title: string;
      description: string;
      duration: string;
      level: string;
      provider: string;
      imageSrc?: string; // Optional image source
      imageAlt?: string; // Optional image alt text
      badges?: string[]; // Optional array of badges (e.g., 'Top Rated')
      href: string; // Link URL for the course details page
    }

    const CourseCard: React.FC<CourseCardProps> = ({
      id,
      title,
      description,
      duration,
      level,
      provider,
      imageSrc,
      imageAlt = `Image for ${title} course`, // Default alt text
      badges,
      href
    }) => {
      return (
        <div key={id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-100 hover:shadow-lg transition-all h-full">
          {/* Course Image Section */}
          <div className="aspect-video relative bg-gray-200">
            {/* Use placeholder if actual image isn't available */}
            <Image
              src={imageSrc || `https://placehold.co/800x450/e2e8f0/4a5568?text=${title.replace(/\s+/g, '+')}`}
              alt={imageAlt}
              fill // Use fill layout to cover the container
              className="object-cover" // Ensure image covers the area
              unoptimized={!imageSrc || imageSrc.startsWith('https://placehold.co')}
            />

            {/* Provider badge */}
            <div className="absolute top-4 left-4 bg-white rounded-full px-3 py-1 text-xs font-semibold text-gray-700 shadow">
              {provider}
            </div>

            {/* Badges */}
            {badges && badges.length > 0 && (
              <div className="absolute top-4 right-4 flex flex-col space-y-1 items-end">
                {badges.map((badge, index) => (
                  <span
                    key={index}
                    className="bg-red-600 text-white rounded-full px-3 py-1 text-xs font-semibold shadow"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Course Info Section */}
          <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
              <Link href={href}>
                <span className="absolute inset-0" aria-hidden="true" /> {/* Make card clickable */}
                {title}
              </Link>
            </h3>
            <p className="mt-2 text-sm text-gray-500 flex-grow line-clamp-3">{description}</p> {/* Limit description lines */}

            {/* Course Meta Info */}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="inline-flex items-center">
                <Calendar className="h-3 w-3 mr-1.5 text-gray-400" /> {duration}
              </span>
              <span className="inline-flex items-center">
                <GraduationCap className="h-3 w-3 mr-1.5 text-gray-400" /> {level}
              </span>
            </div>

            {/* Learn More Link (appears on hover within the card) */}
            <div className="mt-4 pt-4 border-t border-gray-100">
               <Link
                 href={href}
                 className="text-sm font-medium text-red-600 hover:text-red-700 inline-flex items-center relative z-10" // Ensure link is clickable above the absolute span
                >
                 Learn More <ArrowRight className="ml-1.5 h-4 w-4" />
               </Link>
            </div>
          </div>
        </div>
      );
    };

    export default CourseCard;
    