import { NextRequest } from 'next/server';
import DOMPurify from 'isomorphic-dompurify';

// Input validation and sanitization utilities
export class SecurityUtils {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      FORBID_SCRIPT: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
    });
  }

  /**
   * Validate and sanitize user input
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove null bytes and other dangerous characters
    return input
      .replace(/\0/g, '') // null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control characters
      .trim();
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Check if string contains potential SQL injection patterns
   */
  static containsSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
      /(--|#|\/\*|\*\/)/,
      /(\bOR\s+\d+\s*=\s*\d+)/i,
      /(\bAND\s+\d+\s*=\s*\d+)/i,
      /('|(\\))/
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length];
    }
    
    return result;
  }

  /**
   * Hash password securely (for additional security beyond NextAuth)
   */
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if request is from a trusted source
   */
  static isTrustedRequest(req: NextRequest): boolean {
    const userAgent = req.headers.get('user-agent');
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    
    // Check for suspicious patterns
    if (!userAgent || userAgent.length < 10) {
      return false;
    }
    
    // Check for bot-like user agents
    const suspiciousAgents = [
      'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python'
    ];
    
    const lowerUserAgent = userAgent.toLowerCase();
    if (suspiciousAgents.some(agent => lowerUserAgent.includes(agent))) {
      return false;
    }
    
    return true;
  }

  /**
   * Log security event for monitoring
   */
  static logSecurityEvent(event: {
    type: 'rate_limit' | 'csrf' | 'xss' | 'sql_injection' | 'suspicious_request';
    ip: string;
    userAgent?: string;
    path?: string;
    details?: any;
  }): void {
    // In production, this should integrate with your logging service
    // For now, we'll use console.warn for development
    console.warn(`[SECURITY EVENT] ${event.type}:`, {
      timestamp: new Date().toISOString(),
      ...event
    });
    
    // TODO: Integrate with monitoring service like Sentry, DataDog, etc.
    // Example:
    // Sentry.captureMessage(`Security Event: ${event.type}`, {
    //   level: 'warning',
    //   extra: event
    // });
  }

  /**
   * Validate file upload security
   */
  static validateFileUpload(file: File): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'text/plain',
      'application/zip'
    ];

    if (file.size > maxSize) {
      errors.push('File size exceeds 50MB limit');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }

    // Check file name for suspicious patterns
    const suspiciousPatterns = [
      /\.php$/i,
      /\.jsp$/i,
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.com$/i,
      /\.pif$/i,
      /\.vbs$/i,
      /\.js$/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      errors.push('File type not allowed for security reasons');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Middleware helper for API route protection
export function withSecurity(handler: any) {
  return async (req: NextRequest, ...args: any[]) => {
    // Check if request is trusted
    if (!SecurityUtils.isTrustedRequest(req)) {
      SecurityUtils.logSecurityEvent({
        type: 'suspicious_request',
        ip: req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || undefined,
        path: req.nextUrl.pathname
      });
      
      return new Response('Suspicious request detected', { status: 403 });
    }

    // Continue with the original handler
    return handler(req, ...args);
  };
}

// CSRF token utilities
export class CSRFProtection {
  private static readonly SECRET_KEY = process.env.CSRF_SECRET || 'default-csrf-secret';

  static generateToken(): string {
    return SecurityUtils.generateSecureToken(32);
  }

  static async validateToken(token: string, userSession?: string): Promise<boolean> {
    if (!token || typeof token !== 'string') return false;
    
    // In a real implementation, you'd store and validate against stored tokens
    // For now, we'll do basic validation
    return token.length === 32 && /^[a-zA-Z0-9]+$/.test(token);
  }
}