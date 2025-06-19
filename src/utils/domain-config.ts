// Domain configuration and compatibility utilities

// Supported domains for the application
export const SUPPORTED_DOMAINS = {
  production: [
    'techgetafrica.com',
    'www.techgetafrica.com'
  ],
  development: [
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
  ]
};

// Get the current environment
export function getEnvironment(): 'production' | 'development' {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (SUPPORTED_DOMAINS.development.includes(hostname)) {
      return 'development';
    }
  }
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}

// Check if current domain is supported
export function isDomainSupported(): boolean {
  if (typeof window === 'undefined') return true; // Server-side is always supported
  
  const hostname = window.location.hostname;
  const env = getEnvironment();
  
  return SUPPORTED_DOMAINS[env].includes(hostname);
}

// Get the canonical URL for the current environment
export function getCanonicalDomain(): string {
  const env = getEnvironment();
  
  if (env === 'development') {
    return 'localhost:3000';
  }
  
  return 'techgetafrica.com'; // Always use non-www as canonical
}

// Get the full canonical URL
export function getCanonicalUrl(path: string = ''): string {
  const domain = getCanonicalDomain();
  const protocol = getEnvironment() === 'development' ? 'http' : 'https';
  
  return `${protocol}://${domain}${path.startsWith('/') ? path : '/' + path}`;
}

// Get domain info for debugging
export function getDomainInfo() {
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'server-side';
  const env = getEnvironment();
  const isSupported = isDomainSupported();
  const canonical = getCanonicalDomain();
  
  return {
    currentDomain,
    environment: env,
    isSupported,
    canonicalDomain: canonical,
    supportedDomains: SUPPORTED_DOMAINS[env],
    fullCanonicalUrl: getCanonicalUrl()
  };
}

// Clerk-specific domain validation
export function validateClerkDomain(): {
  isValid: boolean;
  message: string;
  recommendations: string[];
} {
  const domainInfo = getDomainInfo();
  
  if (!domainInfo.isSupported) {
    return {
      isValid: false,
      message: `Current domain "${domainInfo.currentDomain}" is not configured for Clerk authentication.`,
      recommendations: [
        'Use one of the supported domains: ' + domainInfo.supportedDomains.join(', '),
        'If this is a production domain, add it to your Clerk dashboard',
        'Clear browser cache and cookies if switching domains'
      ]
    };
  }
  
  return {
    isValid: true,
    message: `Domain "${domainInfo.currentDomain}" is properly configured for Clerk.`,
    recommendations: [
      'Domain is correctly configured',
      'Clerk authentication should work properly'
    ]
  };
}

