# TechGetAfrica LMS - Production Deployment Guide

This guide covers deploying the TechGetAfrica Learning Management System to production with proper security, monitoring, and performance optimizations.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (for caching)

### Environment Setup

1. **Clone and Setup**
```bash
git clone <repository-url>
cd techlanding
cp .env.example .env.local
```

2. **Configure Environment Variables**
```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-32-character-secret-key"
CLERK_SECRET_KEY="your-clerk-secret"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-public-key"

# Payment Integration
PAYSTACK_SECRET_KEY="your-paystack-secret"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="your-paystack-public-key"

# File Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email
RESEND_API_KEY="your-resend-api-key"

# Security
CSRF_SECRET="your-csrf-secret"

# Monitoring (Optional)
SENTRY_DSN="your-sentry-dsn"
```

### 🐳 Docker Deployment

#### Development Environment
```bash
# Start development services
docker-compose --profile development up -d

# Access services:
# - App: http://localhost:3000
# - PgAdmin: http://localhost:8080
# - Database: localhost:5432
```

#### Production Environment
```bash
# Build and deploy production
docker-compose --profile production up -d

# With monitoring
docker-compose --profile production --profile monitoring up -d

# Access services:
# - App: http://localhost:3000 (behind nginx)
# - Grafana: http://localhost:3001
# - Prometheus: http://localhost:9090
```

### 🔧 Manual Deployment

#### 1. Install Dependencies
```bash
npm install --production
```

#### 2. Build Application
```bash
npm run build
```

#### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
```

#### 4. Start Application
```bash
npm start
```

## 🏗️ Infrastructure Components

### Application Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Next.js App   │    │   PostgreSQL    │
│     (Nginx)     │───▶│   (Container)   │───▶│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │   (Caching)     │
                       └─────────────────┘
```

### Security Features
- ✅ Rate limiting (implemented in middleware)
- ✅ CSRF protection
- ✅ XSS protection with DOMPurify
- ✅ SQL injection prevention
- ✅ HTTP security headers
- ✅ Input validation and sanitization
- ✅ File upload security

### Performance Optimizations
- ✅ In-memory caching with LRU cache
- ✅ Database query optimization
- ✅ Image optimization with Cloudinary
- ✅ Code splitting and lazy loading
- ✅ Bundle size optimization

## 📊 Monitoring & Analytics

### Health Checks
The application includes comprehensive health monitoring:

```bash
curl http://localhost:3000/api/health
```

Response example:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": "healthy",
    "memory": "normal",
    "uptime": 86400
  },
  "memory": {
    "rss": 150,
    "heapTotal": 80,
    "heapUsed": 45,
    "external": 10
  }
}
```

### Monitoring Stack
- **Grafana**: Visualization and alerting
- **Prometheus**: Metrics collection
- **Application logs**: Structured JSON logging

### Key Metrics to Monitor
1. **Application Performance**
   - Response times
   - Error rates
   - Throughput (requests/second)

2. **System Resources**
   - Memory usage
   - CPU utilization
   - Disk space

3. **Business Metrics**
   - User registrations
   - Course completions
   - Payment success rates

## 🔒 Security Checklist

### Pre-Production Security Audit
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] Security headers implemented
- [ ] CSRF protection enabled
- [ ] Input validation in place
- [ ] File upload restrictions set

### Regular Security Maintenance
- [ ] Dependencies updated monthly
- [ ] Security patches applied
- [ ] Access logs monitored
- [ ] Backup systems tested
- [ ] Incident response plan reviewed

## 🧪 Testing

### Run Test Suite
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Testing Checklist
- [ ] Unit tests for utilities (>80% coverage)
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical user flows
- [ ] Security vulnerability scanning
- [ ] Performance testing under load

## 🚦 Deployment Process

### CI/CD Pipeline (Recommended)
1. **Code Quality Checks**
   - ESLint and Prettier
   - TypeScript compilation
   - Test suite execution

2. **Security Scanning**
   - Dependency vulnerability check
   - SAST (Static Application Security Testing)
   - Docker image scanning

3. **Build and Test**
   - Docker image build
   - Integration testing
   - Performance benchmarking

4. **Deployment**
   - Blue-green deployment
   - Database migrations
   - Health check verification
   - Traffic routing

### Manual Deployment Steps
```bash
# 1. Backup current production
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm ci --production

# 4. Run database migrations
npx prisma db push

# 5. Build application
npm run build

# 6. Restart services
docker-compose --profile production restart app

# 7. Verify deployment
curl -f http://localhost:3000/api/health
```

## 📈 Performance Tuning

### Database Optimization
```sql
-- Create recommended indexes
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_published ON courses(published);
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
```

### Caching Strategy
- **Application-level**: LRU cache for frequently accessed data
- **Database-level**: Query result caching
- **CDN-level**: Static asset caching via Cloudinary

### Bundle Optimization
- Tree-shaking enabled
- Dynamic imports for heavy components
- Image optimization and lazy loading
- Critical CSS inlined

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
docker exec -it techlanding_postgres pg_isready -U postgres

# View database logs
docker logs techlanding_postgres
```

#### Application Won't Start
```bash
# Check application logs
docker logs techlanding_app

# Verify environment variables
docker exec techlanding_app env | grep -E "(DATABASE|CLERK|PAYSTACK)"

# Check disk space
df -h
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check memory usage
curl http://localhost:3000/api/health | jq '.memory'

# Review slow queries
tail -f /var/log/postgresql/postgresql.log | grep "slow query"
```

### Log Locations
- Application logs: `docker logs techlanding_app`
- Nginx access logs: `/var/log/nginx/access.log`
- Nginx error logs: `/var/log/nginx/error.log`
- PostgreSQL logs: `docker logs techlanding_postgres`

## 📞 Support

For deployment support and production issues:
- Check the troubleshooting section above
- Review application logs for errors
- Monitor system resources and health endpoints
- Contact the development team with relevant logs and metrics

## 🔄 Backup and Recovery

### Automated Backups
```bash
#!/bin/bash
# backup-script.sh - Run daily via cron
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > /backups/db_backup_$DATE.sql.gz

# Keep last 30 days of backups
find /backups -name "db_backup_*.sql.gz" -mtime +30 -delete
```

### Recovery Process
```bash
# Restore from backup
gunzip -c /backups/db_backup_YYYYMMDD_HHMMSS.sql.gz | psql $DATABASE_URL
```

---

**Last updated**: January 2024
**Version**: 1.0.0