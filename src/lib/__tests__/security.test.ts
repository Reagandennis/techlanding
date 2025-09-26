import { SecurityUtils, CSRFProtection } from '../security'

describe('SecurityUtils', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const malicious = '<script>alert("xss")</script><p>Safe content</p>'
      const sanitized = SecurityUtils.sanitizeHtml(malicious)
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('<p>Safe content</p>')
    })

    it('should allow safe HTML tags', () => {
      const safe = '<p>Safe <strong>content</strong> with <a href="/test">link</a></p>'
      const sanitized = SecurityUtils.sanitizeHtml(safe)
      expect(sanitized).toBe(safe)
    })

    it('should remove forbidden tags', () => {
      const malicious = '<form><input type="text"><button>Submit</button></form>'
      const sanitized = SecurityUtils.sanitizeHtml(malicious)
      expect(sanitized).not.toContain('<form>')
      expect(sanitized).not.toContain('<input>')
      expect(sanitized).not.toContain('<button>')
    })
  })

  describe('sanitizeInput', () => {
    it('should remove null bytes', () => {
      const malicious = 'test\0malicious'
      const sanitized = SecurityUtils.sanitizeInput(malicious)
      expect(sanitized).toBe('testmalicious')
    })

    it('should remove control characters', () => {
      const malicious = 'test\x08\x1Fmalicious'
      const sanitized = SecurityUtils.sanitizeInput(malicious)
      expect(sanitized).toBe('testmalicious')
    })

    it('should handle null and undefined inputs', () => {
      expect(SecurityUtils.sanitizeInput(null as any)).toBe('')
      expect(SecurityUtils.sanitizeInput(undefined as any)).toBe('')
      expect(SecurityUtils.sanitizeInput('')).toBe('')
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(SecurityUtils.isValidEmail('test@example.com')).toBe(true)
      expect(SecurityUtils.isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(SecurityUtils.isValidEmail('invalid.email')).toBe(false)
      expect(SecurityUtils.isValidEmail('@domain.com')).toBe(false)
      expect(SecurityUtils.isValidEmail('test@')).toBe(false)
      expect(SecurityUtils.isValidEmail('')).toBe(false)
    })
  })

  describe('isValidPhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(SecurityUtils.isValidPhoneNumber('+1234567890')).toBe(true)
      expect(SecurityUtils.isValidPhoneNumber('1234567890')).toBe(true)
      expect(SecurityUtils.isValidPhoneNumber('+1 (234) 567-8900')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(SecurityUtils.isValidPhoneNumber('abc123')).toBe(false)
      expect(SecurityUtils.isValidPhoneNumber('123')).toBe(false)
      expect(SecurityUtils.isValidPhoneNumber('')).toBe(false)
    })
  })

  describe('containsSqlInjection', () => {
    it('should detect SQL injection patterns', () => {
      expect(SecurityUtils.containsSqlInjection("'; DROP TABLE users; --")).toBe(true)
      expect(SecurityUtils.containsSqlInjection('1 OR 1=1')).toBe(true)
      expect(SecurityUtils.containsSqlInjection('SELECT * FROM users')).toBe(true)
      expect(SecurityUtils.containsSqlInjection('/* comment */ SELECT')).toBe(true)
    })

    it('should allow safe input', () => {
      expect(SecurityUtils.containsSqlInjection('normal user input')).toBe(false)
      expect(SecurityUtils.containsSqlInjection('search for something')).toBe(false)
      expect(SecurityUtils.containsSqlInjection('123')).toBe(false)
    })
  })

  describe('generateSecureToken', () => {
    it('should generate token of specified length', () => {
      const token = SecurityUtils.generateSecureToken(16)
      expect(token).toHaveLength(16)
      expect(/^[a-zA-Z0-9]+$/.test(token)).toBe(true)
    })

    it('should generate unique tokens', () => {
      const token1 = SecurityUtils.generateSecureToken(32)
      const token2 = SecurityUtils.generateSecureToken(32)
      expect(token1).not.toBe(token2)
    })

    it('should use default length when not specified', () => {
      const token = SecurityUtils.generateSecureToken()
      expect(token).toHaveLength(32)
    })
  })

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const result = SecurityUtils.validatePasswordStrength('StrongP@ssw0rd!')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject weak passwords', () => {
      const result = SecurityUtils.validatePasswordStrength('weak')
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should provide specific error messages', () => {
      const result = SecurityUtils.validatePasswordStrength('short')
      expect(result.errors).toContain('Password must be at least 8 characters long')
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
      expect(result.errors).toContain('Password must contain at least one number')
      expect(result.errors).toContain('Password must contain at least one special character')
    })
  })

  describe('validateFileUpload', () => {
    it('should validate allowed file types', () => {
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const result = SecurityUtils.validateFileUpload(validFile)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject disallowed file types', () => {
      const invalidFile = new File(['test'], 'test.exe', { type: 'application/exe' })
      const result = SecurityUtils.validateFileUpload(invalidFile)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File type not allowed')
    })

    it('should reject files that are too large', () => {
      const largeContent = new Array(51 * 1024 * 1024).fill('a') // 51MB
      const largeFile = new File([largeContent.join('')], 'large.jpg', { type: 'image/jpeg' })
      const result = SecurityUtils.validateFileUpload(largeFile)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File size exceeds 50MB limit')
    })

    it('should reject files with suspicious extensions', () => {
      const suspiciousFile = new File(['test'], 'malware.php', { type: 'text/plain' })
      const result = SecurityUtils.validateFileUpload(suspiciousFile)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File type not allowed for security reasons')
    })
  })

  describe('hashPassword', () => {
    it('should hash passwords consistently', async () => {
      const password = 'testPassword123'
      const hash1 = await SecurityUtils.hashPassword(password)
      const hash2 = await SecurityUtils.hashPassword(password)
      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(password)
      expect(hash1).toHaveLength(64) // SHA-256 hex string length
    })
  })
})

describe('CSRFProtection', () => {
  describe('generateToken', () => {
    it('should generate valid CSRF tokens', () => {
      const token = CSRFProtection.generateToken()
      expect(token).toHaveLength(32)
      expect(/^[a-zA-Z0-9]+$/.test(token)).toBe(true)
    })

    it('should generate unique tokens', () => {
      const token1 = CSRFProtection.generateToken()
      const token2 = CSRFProtection.generateToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('validateToken', () => {
    it('should validate properly formatted tokens', async () => {
      const validToken = SecurityUtils.generateSecureToken(32)
      const isValid = await CSRFProtection.validateToken(validToken)
      expect(isValid).toBe(true)
    })

    it('should reject invalid tokens', async () => {
      expect(await CSRFProtection.validateToken('')).toBe(false)
      expect(await CSRFProtection.validateToken('short')).toBe(false)
      expect(await CSRFProtection.validateToken('invalid-token!')).toBe(false)
      expect(await CSRFProtection.validateToken(null as any)).toBe(false)
    })
  })
})