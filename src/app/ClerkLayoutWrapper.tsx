
'use client';

// This is a client component wrapper for ClerkProvider
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';

export default function ClerkLayoutWrapper({ children }: { children: React.ReactNode }) {
  // Only render ClerkProvider if keys are available
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
