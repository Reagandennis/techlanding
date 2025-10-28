import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: 'unknown',
      memory: 'unknown',
      uptime: process.uptime(),
    }
  };

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.checks.database = 'healthy';
  } catch (error) {
    healthCheck.status = 'degraded';
    healthCheck.checks.database = 'unhealthy';
    console.error('Database health check failed:', error);
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage();
  const memoryUsageMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024),
  };

  // Flag as degraded if heap usage is too high (>500MB as example)
  if (memoryUsageMB.heapUsed > 500) {
    healthCheck.status = 'degraded';
    healthCheck.checks.memory = 'high';
  } else {
    healthCheck.checks.memory = 'normal';
  }

  // Return appropriate HTTP status code
  const httpStatus = healthCheck.status === 'healthy' ? 200 : 
                    healthCheck.status === 'degraded' ? 200 : 503;

  return NextResponse.json({
    ...healthCheck,
    memory: memoryUsageMB,
  }, { status: httpStatus });
}