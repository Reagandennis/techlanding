'use client';

import { UserProvider } from '@auth0/nextjs-auth0/client';
import React from 'react';
type Auth0ProviderProps = {
  children: React.ReactNode;
};

export default function Auth0Provider({ children }: Auth0ProviderProps) {
  return <UserProvider>{children}</UserProvider>;
}