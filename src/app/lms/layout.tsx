import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import ClerkLayoutWrapper from "../ClerkLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechGetAfrica LMS - Learning Management System",
  description: "Professional learning management system for TechGetAfrica students, instructors, and administrators.",
};

export default function LMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <ClerkLayoutWrapper>
          {/* No main navigation here - LMS has its own navigation */}
          {children}
        </ClerkLayoutWrapper>
      </body>
    </html>
  );
}