
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { defaultMetadata } from "./metadata";
import AuthProvider from "../shared/components/auth/AuthProvider";
import Script from "next/script";
import ClerkLayoutWrapper from "./ClerkLayoutWrapper";
import { BusinessVerticalProvider } from "../shared/context/BusinessVerticalContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Techgetafrica",
            "url": "https://techgetafrica.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://techgetafrica.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Techgetafrica",
            "url": "https://techgetafrica.com",
            "logo": "https://techgetafrica.com/images/techgetafrica.png",
            "sameAs": [
              "https://www.linkedin.com/company/techgetafrica",
              "https://twitter.com/techgetafrica",
            ],
          })}
        </script>
      </head>
      <body className={inter.className}>
        <ClerkLayoutWrapper>
          <BusinessVerticalProvider>
            {children}
          </BusinessVerticalProvider>
        </ClerkLayoutWrapper>

        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />

        <Script id="suppress-extension-warnings">{`
          if (typeof window !== 'undefined') {
            const originalWarn = console.warn;
            console.warn = function(...args) {
              const message = args[0];
              if (typeof message === 'string' && 
                  (message.includes('React Router Future Flag Warning') ||
                  message.includes('v7_startTransition') ||
                  message.includes('v7_relativeSplatPath'))) {
                return;
              }
              originalWarn.apply(console, args);
            };
          }
        `}</Script>
      </body>
    </html>
  );
}
