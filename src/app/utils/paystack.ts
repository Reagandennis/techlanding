// utils/paystack.ts
export const loadPaystack = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.resolve(); // Skip on server
  }

  if ((window as any).PaystackPop) {
    return Promise.resolve(); // Already loaded
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));

    document.body.appendChild(script);
  });
};

export const initializePayment = (
  email: string,
  amount: number,
  callback: (response: any) => void,
  metadata?: Record<string, any>
): void => {
  if (typeof window === 'undefined' || !(window as any).PaystackPop) {
    throw new Error('Paystack not loaded');
  }

  const handler = (window as any).PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100, // Convert to kobo
    currency: 'KES',
    ref: `cert-${Date.now()}`,
    metadata,
    callback,
    onClose: () => console.log('Payment window closed'),
  });

  handler.openIframe();
};