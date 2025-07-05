
'use client';

// This is a client component wrapper for ClerkProvider
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';

export default function ClerkLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
