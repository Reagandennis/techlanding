
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { defaultMetadata } from "./metadata";
import Script from "next/script";
import { AuthProvider } from '@/contexts/AuthContext';
import DebugAuth from "@/components/DebugAuth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = defaultMetadata;

import Navigation from '@/components/Navigation';

// ... (imports remain the same)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ... (head content remains the same) */}
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          {children}
          <DebugAuth />
        </AuthProvider>

        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
