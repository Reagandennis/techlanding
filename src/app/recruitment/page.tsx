
'use client';

import React from 'react';
import RecruitmentAgencyPlatform from '../componets/RecruitmentAgencyPlatform';
import Navbar from '../componets/Navbar';
import Footer from '../componets/Footer';

export default function RecruitmentPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white">
      <Navbar />
      <main className="flex-grow">
        <RecruitmentAgencyPlatform />
      </main>
      <Footer />
    </div>
  );
}
