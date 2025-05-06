// src/app/api/auth/[auth0]/route.ts
export const dynamic = 'force-dynamic';
import { handleAuth } from '@auth0/nextjs-auth0/edge';

export const GET = handleAuth();
export const POST = handleAuth();
