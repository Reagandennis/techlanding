# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TechGetAfrica is a Next.js 15 application built with TypeScript, serving as a tech education platform. The application uses the App Router, integrates authentication via both Clerk and NextAuth.js, and includes Prisma for database management.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Generate sitemap (runs automatically after build)
npm run postbuild
```

### Database Operations (Prisma)
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Reset database (development only)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio

# Deploy migrations to production
npx prisma migrate deploy
```

### Single File Operations
```bash
# Run TypeScript check on specific file
npx tsc --noEmit path/to/file.tsx

# Lint specific file
npx eslint src/app/path/to/file.tsx

# Format with Prettier (if configured)
npx prettier --write src/app/path/to/file.tsx
```

## Architecture Overview

### Authentication Architecture
This project uses a **dual authentication system**:
- **Clerk**: Primary authentication provider for user-facing features (sign in, sign up, user management)
- **NextAuth.js**: Secondary authentication system with custom credentials and Google OAuth

**Key files:**
- `src/app/ClerkLayoutWrapper.tsx` - Clerk provider wrapper
- `src/lib/auth/auth.ts` - NextAuth configuration
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API routes

### Database Schema
PostgreSQL database managed via Prisma with these core models:
- `User` - User accounts with role-based access (USER/ADMIN)
- `Account` - OAuth account linkages
- `Session` - User sessions
- `VerificationToken` - Email verification tokens

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth endpoints
│   │   └── send-email/    # Email notification service
│   ├── components/        # Shared React components (Auth providers)
│   ├── componets/         # UI components (note: typo in folder name)
│   └── (pages)/           # Application pages
├── lib/                   # Shared utilities
│   ├── auth/             # Authentication configuration
│   ├── utils/            # Helper functions
│   └── prisma.ts         # Database client
└── hooks/                 # Custom React hooks
```

### Component Architecture
- **Client Components**: Most UI components are client-side (`'use client'` directive)
- **Server Actions**: Email handling and form processing use server actions
- **Component Naming**: Be aware of the `componets/` typo in the folder structure
- **Styling**: Tailwind CSS with custom color scheme (red primary, gray neutrals)

### Email System
Nodemailer integration for form submissions:
- **Provider**: Zoho SMTP (primary), Gmail (consulting forms)
- **Templates**: HTML email templates for different user types (students, partners, institutions)
- **Environment Variables**: Requires `EMAIL_USER`, `EMAIL_PASSWORD`, `GMAIL_USER`, `GMAIL_PASS`

## Development Patterns

### Environment Variables Required
```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""

# Authentication (NextAuth)
NEXTAUTH_SECRET=""
NEXTAUTH_URL=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email
EMAIL_USER=""          # Zoho email
EMAIL_PASSWORD=""      # Zoho password
GMAIL_USER=""          # Gmail for consulting
GMAIL_PASS=""          # Gmail app password
```

### Code Patterns
- **Form Handling**: Combination of client-side forms with server actions
- **Image Optimization**: Uses Next.js Image component with remote pattern for `placehold.co`
- **Metadata**: Comprehensive SEO setup in `src/app/metadata.ts`
- **Error Handling**: ESLint configured to ignore common React warnings

### Route Protection
Middleware protects routes:
- `/dashboard/*` - Requires authentication
- `/profile/*` - Requires authentication

### Key Dependencies
- **UI**: Tailwind CSS, Lucide React icons
- **Auth**: Clerk, NextAuth.js with Prisma adapter
- **Database**: Prisma with PostgreSQL
- **Email**: Nodemailer
- **Forms**: Zod validation

## Development Notes

### Known Issues
- Typo in component folder name (`componets` instead of `components`)
- Dual authentication system may cause complexity - **Note**: Dashboard uses Clerk, not NextAuth
- No testing framework currently configured
- Console warnings suppressed for React Router Future Flags
- Removed unused Auth0 route that was causing build failures

### When Working with Forms
- Email forms use server actions in `actions.ts` files
- Multiple email templates exist for different user types
- Form validation uses Zod schemas

### When Working with Database
- Always run `npx prisma generate` after schema changes
- Database uses CUID for primary keys
- User roles are enum-based (USER/ADMIN)

### When Adding New Pages
- Use App Router file-based routing in `src/app/`
- Add route protection in `middleware.ts` if needed
- Follow existing metadata patterns for SEO

### SEO Considerations
- Sitemap generation configured with `next-sitemap`
- Comprehensive metadata setup
- Structured data (JSON-LD) in layout
- Multi-language support configured (en-US, fr-FR)
