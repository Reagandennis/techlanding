'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BusinessVertical } from '../types/business';

interface BusinessVerticalContextType {
  currentVertical: BusinessVertical | null;
  setVertical: (vertical: BusinessVertical | null) => void;
  isVerticalActive: (vertical: BusinessVertical) => boolean;
}

const BusinessVerticalContext = createContext<BusinessVerticalContextType | undefined>(undefined);

interface BusinessVerticalProviderProps {
  children: React.ReactNode;
}

export function BusinessVerticalProvider({ children }: BusinessVerticalProviderProps) {
  const [currentVertical, setCurrentVertical] = useState<BusinessVertical | null>(null);

  const setVertical = (vertical: BusinessVertical | null) => {
    setCurrentVertical(vertical);
  };

  const isVerticalActive = (vertical: BusinessVertical) => {
    return currentVertical === vertical;
  };

  // Auto-detect vertical from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      
      if (path.startsWith('/certifications') || path.startsWith('/programs') || path.startsWith('/accreditation') || path.startsWith('/courses')) {
        setCurrentVertical('education');
      } else if (path.startsWith('/recruitment')) {
        setCurrentVertical('recruitment');
      } else if (path.startsWith('/consulting')) {
        setCurrentVertical('consulting');
      } else if (path.startsWith('/development')) {
        setCurrentVertical('development');
      } else {
        setCurrentVertical(null);
      }
    }
  }, []);

  const value = {
    currentVertical,
    setVertical,
    isVerticalActive,
  };

  return (
    <BusinessVerticalContext.Provider value={value}>
      {children}
    </BusinessVerticalContext.Provider>
  );
}

export function useBusinessVertical() {
  const context = useContext(BusinessVerticalContext);
  if (context === undefined) {
    throw new Error('useBusinessVertical must be used within a BusinessVerticalProvider');
  }
  return context;
}
