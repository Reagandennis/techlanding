// Domain testing and verification utilities

// Test both domain variants for Clerk authentication
export function testDomainVariants() {
  const currentHost = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  
  const domainTests = {
    'localhost:3000': {
      environment: 'development',
      clerkExpected: 'development keys (pk_test_...)',
      status: 'Should work with development keys',
      keyType: 'development'
    },
    'techgetafrica.com': {
      environment: 'production',
      clerkExpected: 'production keys (pk_live_...)',
      status: 'Ready for production',
      keyType: 'production'
    },
    'www.techgetafrica.com': {
      environment: 'production',
      clerkExpected: 'production keys (pk_live_...)',
      status: 'Ready for production',
      keyType: 'production'
    }
  };
  
  return {
    currentHost,
    currentTest: domainTests[currentHost as keyof typeof domainTests] || {
      environment: 'unknown',
      clerkExpected: 'unknown',
      status: 'Domain not configured',
      keyType: 'unknown'
    },
    allTests: domainTests
  };
}

// Check if we're running on production domain
export function isProductionDomain(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return hostname === 'techgetafrica.com' || hostname === 'www.techgetafrica.com';
}

// Check if we're running on localhost
export function isLocalhost(): boolean {
  if (typeof window === 'undefined') return true;
  
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost');
}

// Get appropriate Clerk configuration based on current domain
export function getClerkConfigForDomain() {
  const isProd = isProductionDomain();
  const isLocal = isLocalhost();
  
  if (isProd) {
    return {
      environment: 'production',
      expectedKeyType: 'pk_live_',
      frontendApi: 'https://clerk.techgetafrica.com',
      allowedDomains: ['techgetafrica.com', 'www.techgetafrica.com'],
      configStatus: 'Production ready'
    };
  }
  
  if (isLocal) {
    return {
      environment: 'development',
      expectedKeyType: 'pk_test_',
      frontendApi: 'Development instance',
      allowedDomains: ['localhost', '127.0.0.1'],
      configStatus: 'Development mode'
    };
  }
  
  return {
    environment: 'unknown',
    expectedKeyType: 'unknown',
    frontendApi: 'unknown',
    allowedDomains: [],
    configStatus: 'Domain not configured'
  };
}

// Comprehensive domain validation
export function validateCurrentDomain() {
  const domainTest = testDomainVariants();
  const clerkConfig = getClerkConfigForDomain();
  const currentKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  
  const validation = {
    domain: {
      current: domainTest.currentHost,
      environment: clerkConfig.environment,
      supported: clerkConfig.allowedDomains.length > 0,
      status: clerkConfig.configStatus
    },
    clerk: {
      expectedKeyType: clerkConfig.expectedKeyType,
      currentKeyType: currentKey.startsWith('pk_live_') ? 'production' : 
                     currentKey.startsWith('pk_test_') ? 'development' : 'unknown',
      keyMatch: currentKey.startsWith(clerkConfig.expectedKeyType),
      frontendApi: clerkConfig.frontendApi
    },
    issues: [] as string[],
    recommendations: [] as string[]
  };
  
  // Check for issues
  if (!validation.domain.supported) {
    validation.issues.push('Current domain is not in the supported list');
    validation.recommendations.push('Add this domain to your configuration');
  }
  
  if (!validation.clerk.keyMatch && validation.clerk.currentKeyType !== 'unknown') {
    validation.issues.push(`Using ${validation.clerk.currentKeyType} keys on ${validation.domain.environment} domain`);
    
    if (validation.domain.environment === 'production') {
      validation.recommendations.push('Switch to production keys for production domains');
    } else {
      validation.recommendations.push('Get development keys from Clerk dashboard for localhost');
    }
  }
  
  if (validation.clerk.currentKeyType === 'unknown') {
    validation.issues.push('No valid Clerk keys detected');
    validation.recommendations.push('Configure Clerk keys in environment variables');
  }
  
  return validation;
}

// Generate test URLs for both domain variants
export function generateTestUrls(path: string = '') {
  const basePath = path.startsWith('/') ? path : `/${path}`;
  
  return {
    development: `http://localhost:3000${basePath}`,
    production: {
      primary: `https://techgetafrica.com${basePath}`,
      www: `https://www.techgetafrica.com${basePath}`
    },
    debug: {
      local: `http://localhost:3000/debug/clerk`,
      prod: `https://techgetafrica.com/debug/clerk`,
      www: `https://www.techgetafrica.com/debug/clerk`
    }
  };
}

