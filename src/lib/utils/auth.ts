import { auth } from '@clerk/nextjs';

export function getAuthenticatedUserId(): string | null {
  try {
    const { userId } = auth();
    return userId;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthenticatedUserId();
}
