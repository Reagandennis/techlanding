import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true, // Or whatever options you already have
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**', // Allow any path on this hostname
      },
      // Add other hostnames here if needed in the future
      // e.g., your CMS or storage bucket hostname
    ],
  },
  // ... any other
};

export default nextConfig;
