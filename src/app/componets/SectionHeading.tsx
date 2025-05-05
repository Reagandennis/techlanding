    // File: app/components/SectionHeading.tsx
    // Description: Reusable component for consistent section headings.

    import React from 'react';

    interface SectionHeadingProps {
      eyebrow?: string; // Optional small text above the main title
      title: string; // The main heading text
      description?: string; // Optional paragraph below the title
      id?: string; // Optional ID for linking or aria-labelledby
      alignment?: 'center' | 'left'; // Text alignment (default center)
      className?: string; // Optional additional CSS classes for the container
    }

    const SectionHeading: React.FC<SectionHeadingProps> = ({
      eyebrow,
      title,
      description,
      id,
      alignment = 'center', // Default to center alignment
      className = ''
    }) => {
      const alignmentClass = alignment === 'left' ? 'text-left' : 'text-center';
      const marginClass = alignment === 'left' ? '' : 'mx-auto'; // Add mx-auto for centered descriptions

      return (
        <div className={`${alignmentClass} ${className}`}>
          {/* Eyebrow text */}
          {eyebrow && (
            <h2 className="text-base font-semibold text-red-600 tracking-wide uppercase">
              {eyebrow}
            </h2>
          )}

          {/* Main Title */}
          <p className={`mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl ${alignment === 'left' ? '' : 'tracking-tight'}`} id={id}>
            {title}
          </p>

          {/* Description */}
          {description && (
            <p className={`mt-4 max-w-2xl text-xl text-gray-500 ${marginClass}`}>
              {description}
            </p>
          )}
        </div>
      );
    };

    export default SectionHeading;
    