import { BusinessVertical } from '../types/business';

interface BaseOrganization {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
}

export function getBusinessVerticalStructuredData(vertical: BusinessVertical) {
  const baseOrg: BaseOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TechGetAfrica",
    "url": "https://techgetafrica.com",
    "logo": "https://techgetafrica.com/images/techgetafrica.png",
    "sameAs": [
      "https://www.linkedin.com/company/techgetafrica",
      "https://twitter.com/techgetafrica",
    ],
  };

  const verticalData = {
    education: {
      ...baseOrg,
      "@type": "EducationalOrganization",
      "description": "Leading tech education and certification provider in Africa",
      "courseMode": ["online", "blended"],
      "educationalCredentialAwarded": "Professional Certification"
    },
    recruitment: {
      ...baseOrg, 
      "@type": "Organization",
      "description": "Premier recruitment agency connecting African tech talent with global opportunities",
      "serviceType": "Recruitment Services"
    },
    consulting: {
      ...baseOrg,
      "@type": "ProfessionalService", 
      "description": "Strategic technology consulting for freelancers, startups, and enterprises",
      "serviceType": "Technology Consulting"
    },
    development: {
      ...baseOrg,
      "@type": "Organization",
      "description": "Custom software development services from web apps to enterprise solutions", 
      "serviceType": "Software Development"
    }
  };

  return verticalData[vertical] || baseOrg;
}

export function getDefaultStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TechGetAfrica",
    "url": "https://techgetafrica.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://techgetafrica.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}
