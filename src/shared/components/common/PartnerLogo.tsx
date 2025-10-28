// File: app/components/PartnerLogo.tsx
// Description: Client component to display partner logos with error handling and fallback.

"use client"; // Mark this component as a Client Component

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Use Next.js Image component

// Define the props expected by the PartnerLogo component
interface PartnerLogoProps {
  src: string; // Primary image source URL
  fallbackSrc?: string; // <<<< ADDED: Optional fallback image source URL (e.g., placehold.co)
  alt: string; // Alt text for the image
  className?: string; // Optional additional CSS classes for the container div
  imageClassName?: string; // Optional additional CSS classes for the Image component itself
}

// --- Partner Logo Component ---
const PartnerLogo: React.FC<PartnerLogoProps> = ({
  src,
  fallbackSrc, // <<<< Now correctly received as a prop
  alt,
  className = '',
  imageClassName = ''
}) => {
  const [imgSrc, setImgSrc] = useState(src); // State to hold the current image source
  const [hasError, setHasError] = useState(false); // State to track loading errors

  // Reset image source if the src prop changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false); // Reset error state when src changes
  }, [src]);

  // Handler for image loading errors
  const handleImageError = () => {
    if (hasError) return; // Prevent infinite loop if fallback also fails

    setHasError(true); // Mark that an error occurred
    if (fallbackSrc) {
      setImgSrc(fallbackSrc); // Switch to fallback source if available
    } else {
      // If no fallbackSrc, you might want to hide the image or display alt text differently
      // For now, it will just show the broken image icon if fallbackSrc is not provided
      // Consider setting imgSrc to a default broken image placeholder if needed
      // e.g., setImgSrc('/images/placeholder-broken.png');
    }
  };

  return (
    // Container div with grayscale filter and hover effect
    <div className={`flex justify-center items-center p-4 filter grayscale hover:filter-none transition duration-300 ease-in-out ${className}`}>
      {/* Use Next.js Image component for optimization */}
      {/* Set a fixed size or use layout='fill' with a sized parent */}
      <Image
        key={imgSrc} // Add key to force re-render when imgSrc changes
        src={imgSrc}
        alt={alt}
        width={150} // Provide appropriate width
        height={60} // Provide appropriate height
        className={`object-contain ${imageClassName}`} // Tailwind classes for object fit and custom classes
        onError={handleImageError} // Attach the error handler
        unoptimized={imgSrc.startsWith('https://placehold.co')} // Avoid optimizing placeholder images
      />
    </div>
  );
};

export default PartnerLogo;
