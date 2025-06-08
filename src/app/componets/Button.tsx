    // File: app/components/Button.tsx
    // Description: Reusable Button component for consistent styling.

    import React from 'react';
    import Link from 'next/link';
    import { cn } from '@/lib/utils';

    // Define the props for the Button component
    interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
      variant?: 'primary' | 'secondary' | 'outline';
      href?: string;
      className?: string;
      children: React.ReactNode;
    }

    export default function Button({
      variant = 'primary',
      href,
      className,
      children,
      ...props
    }: ButtonProps) {
      const baseStyles = 'inline-flex items-center justify-center px-6 py-3 border text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
      
      const variantStyles = {
        primary: 'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
        secondary: 'border-transparent text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500',
        outline: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-red-500',
      };

      const combinedClassName = cn(baseStyles, variantStyles[variant], className);

      // If href is provided, render a Link component
      if (href) {
        return (
          <Link href={href} className={combinedClassName}>
            {children}
          </Link>
        );
      }

      // Otherwise, render a button
      return (
        <button className={combinedClassName} {...props}>
          {children}
        </button>
      );
    }
    