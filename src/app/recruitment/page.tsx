
'use client';

import React from 'react';
import RecruitmentAgencyPlatform from '@/components/RecruitmentAgencyPlatform';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RecruitmentPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      
      <main className="flex-grow">
        <RecruitmentAgencyPlatform />
      </main>
      
    </div>
  );
}
