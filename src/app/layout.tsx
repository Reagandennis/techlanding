// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { UserProvider } from "@auth0/nextjs-auth0/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechGetAfrica",
  description:
    "Unlock your tech future with world-class accreditation in Africa. TechGetAfrica provides globally recognized certifications and training programs, empowering Africans to launch and advance their careers in the technology sector.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          {children}
          <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
          </ClerkProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
