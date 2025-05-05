    // File: app/components/Button.tsx
    // Description: Reusable Button component for consistent styling.

    import React from 'react';
    import Link from 'next/link';

    // Define the props for the Button component
    interface ButtonProps {
      href: string; // URL the button links to
      children: React.ReactNode; // Content inside the button (text, icons, etc.)
      variant?: 'primary' | 'secondary' | 'outline' | 'link'; // Style variations
      className?: string; // Optional additional CSS classes
      // Add other props like onClick if needed for non-link buttons
    }

    const Button: React.FC<ButtonProps> = ({ href, children, variant = 'primary', className = '' }) => {
      // Base styles common to all buttons
      const baseStyle = "inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-50";

      // Styles specific to each variant
      const variants = {
        primary: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 border-red-600",
        secondary: "text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500 border-red-100",
        outline: "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-red-500",
        link: "text-red-600 hover:text-red-700 focus:ring-red-500 shadow-none border-none p-0 bg-transparent", // Example link style
      };

      // Combine base styles, variant styles, and any additional classes
      const combinedClassName = `${baseStyle} ${variants[variant]} ${className}`;

      // Render a Next.js Link component styled as a button
      return (
        <Link href={href} className={combinedClassName}>
          {children}
        </Link>
      );
    };

    export default Button;
    