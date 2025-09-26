import { execSync } from 'child_process'

export default async function globalSetup() {
  console.log('🧪 Starting global test setup...')
  
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./test.db'
  process.env.NEXTAUTH_SECRET = 'test-secret'
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
  
  // Initialize test database
  try {
    console.log('📄 Setting up test database...')
    execSync('npx prisma db push --force-reset', {
      stdio: 'pipe',
      cwd: process.cwd(),
    })
    console.log('✅ Test database setup complete')
  } catch (error) {
    console.warn('⚠️ Could not setup test database:', error.message)
    // Continue with tests even if database setup fails
  }
  
  console.log('✅ Global test setup complete')
}