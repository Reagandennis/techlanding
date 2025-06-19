// Utility to verify Clerk configuration
export function verifyClerkConfig() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  
  console.log('Clerk Configuration Status:');
  console.log('Publishable Key:', publishableKey ? 'Set ✓' : 'Missing ✗');
  console.log('Secret Key:', secretKey ? 'Set ✓' : 'Missing ✗');
  
  if (publishableKey) {
    // Decode the publishable key to check the domain
    try {
      const decoded = atob(publishableKey.replace('pk_live_', ''));
      console.log('Domain from key:', decoded);
      
      if (decoded.includes('techgetafrica.com')) {
        console.log('✓ Key is correctly configured for techgetafrica.com (supports both www and non-www)');
      } else {
        console.log('✗ Key appears to be for a different domain');
      }
    } catch (error) {
      console.log('Could not decode publishable key');
    }
  }
  
  // Check current domain
  if (typeof window !== 'undefined') {
    const currentDomain = window.location.hostname;
    const allowedDomains = ['techgetafrica.com', 'www.techgetafrica.com', 'localhost'];
    const isDomainAllowed = allowedDomains.includes(currentDomain);
    
    console.log('Current domain:', currentDomain);
    console.log('Domain allowed:', isDomainAllowed ? '✓' : '✗');
  }
  
  return {
    hasPublishableKey: !!publishableKey,
    hasSecretKey: !!secretKey,
    publishableKey: publishableKey?.substring(0, 20) + '...',
    currentDomain: typeof window !== 'undefined' ? window.location.hostname : 'server-side'
  };
}

// Function to clear Clerk session data
export function clearClerkSession() {
  if (typeof window !== 'undefined') {
    // Clear Clerk-related localStorage items
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('clerk') || key.includes('session'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Cleared localStorage key: ${key}`);
    });
    
    // Clear cookies related to clerk
    document.cookie.split(";").forEach(function(c) { 
      const eqPos = c.indexOf("="); 
      const name = eqPos > -1 ? c.substr(0, eqPos) : c; 
      if (name.trim().includes('clerk') || name.trim().includes('session')) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.techgetafrica.co.ke";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.techgetafrica.com";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        console.log(`Cleared cookie: ${name}`);
      }
    });
    
    console.log('Clerk session data cleared. Please refresh the page.');
  }
}

