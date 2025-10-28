import fs from 'fs'
import path from 'path'

export default async function globalTeardown() {
  console.log('🧹 Starting global test teardown...')
  
  // Clean up test database file if it exists
  const testDbPath = path.join(process.cwd(), 'test.db')
  if (fs.existsSync(testDbPath)) {
    try {
      fs.unlinkSync(testDbPath)
      console.log('🗑️ Test database cleaned up')
    } catch (error) {
      console.warn('⚠️ Could not clean up test database:', error.message)
    }
  }
  
  // Clean up any other test artifacts
  const testArtifacts = [
    'test.db-journal',
    'test.db-shm',
    'test.db-wal'
  ]
  
  testArtifacts.forEach(artifact => {
    const artifactPath = path.join(process.cwd(), artifact)
    if (fs.existsSync(artifactPath)) {
      try {
        fs.unlinkSync(artifactPath)
        console.log(`🗑️ Cleaned up ${artifact}`)
      } catch (error) {
        console.warn(`⚠️ Could not clean up ${artifact}:`, error.message)
      }
    }
  })
  
  console.log('✅ Global test teardown complete')
}