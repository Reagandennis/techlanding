// Environment-aware Clerk configuration

// Development keys (for localhost)
const DEVELOPMENT_KEYS = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV || '',
  secretKey: process.env.CLERK_SECRET_KEY_DEV || ''
};

// Production keys (for techgetafrica.com)
const PRODUCTION_KEYS = {
  publishableKey: 'pk_live_Y2xlcmsudGVjaGdldGFmcmljYS5jb20k',
  secretKey: process.env.CLERK_SECRET_KEY_PROD || 'sk_live_9pp113twSU91bGFZTDakSBbPMaCpvzgvEJCar3FM7z'
};

// Check if we're in development
function isDevelopment(): boolean {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('localhost');
  }
  return process.env.NODE_ENV === 'development';
}

// Get the appropriate Clerk keys for the current environment
export function getClerkKeys() {
  const isDevEnv = isDevelopment();
  
  if (isDevEnv) {
    console.log('🔧 Using Clerk DEVELOPMENT keys for localhost');
    return DEVELOPMENT_KEYS;
  } else {
    console.log('🚀 Using Clerk PRODUCTION keys for techgetafrica.com');
    return PRODUCTION_KEYS;
  }
}

// Get the publishable key for the current environment
export function getClerkPublishableKey(): string {
  const keys = getClerkKeys();
  return keys.publishableKey;
}

// Validate that we have the correct keys for the environment
export function validateEnvironmentKeys(): {
  isValid: boolean;
  message: string;
  environment: 'development' | 'production';
  missingKeys: string[];
} {
  const isDevEnv = isDevelopment();
  const keys = getClerkKeys();
  const missingKeys: string[] = [];
  
  if (!keys.publishableKey) {
    missingKeys.push('Publishable Key');
  }
  
  if (!keys.secretKey) {
    missingKeys.push('Secret Key');
  }
  
  const environment = isDevEnv ? 'development' : 'production';
  
  if (missingKeys.length > 0) {
    return {
      isValid: false,
      message: `Missing ${environment} keys: ${missingKeys.join(', ')}`,
      environment,
      missingKeys
    };
  }
  
  // Check if using correct key type for environment
  if (isDevEnv && keys.publishableKey.startsWith('pk_live_')) {
    return {
      isValid: false,
      message: 'Using PRODUCTION keys in DEVELOPMENT environment. This will cause errors.',
      environment,
      missingKeys: ['Development keys needed']
    };
  }
  
  if (!isDevEnv && keys.publishableKey.startsWith('pk_test_')) {
    return {
      isValid: false,
      message: 'Using DEVELOPMENT keys in PRODUCTION environment. This will not work.',
      environment,
      missingKeys: ['Production keys needed']
    };
  }
  
  return {
    isValid: true,
    message: `${environment} keys are correctly configured`,
    environment,
    missingKeys: []
  };
}

