#!/bin/bash

# Remove Clerk packages
echo "Removing Clerk packages..."
npm uninstall @clerk/nextjs @clerk/themes

# Clean environment variables
echo "Removing Clerk environment variables from .env files..."
find . -name ".env*" -type f -exec sed -i '' '/CLERK_/d' {} \;
find . -name ".env*" -type f -exec sed -i '' '/NEXT_PUBLIC_CLERK_/d' {} \;

# Create backup directory
mkdir -p backups
cp -r src/app/api/webhooks/clerk backups/ 2>/dev/null || true

# Remove Clerk webhook directory
rm -rf src/app/api/webhooks/clerk

# Remove Clerk-specific files
rm -f src/app/ClerkLayoutWrapper.tsx
rm -f src/scripts/sync-clerk-users.ts
rm -f src/lib/user-sync.server.ts
rm -f src/lib/user-db-sync.ts
rm -f src/middleware.backup.ts

echo "Clerk removal complete. Please update your code to use Supabase auth instead."
echo "Run the Supabase auth integration SQL script in your Supabase dashboard next."