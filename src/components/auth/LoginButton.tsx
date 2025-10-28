'use client';

import useAuth from '../../hooks/useAuth';
import Link from 'next/link';

export default function LoginButton() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <button className="btn btn-primary" disabled>Loading...</button>;

  if (isAuthenticated) {
    return (
      <div className="flex gap-2">
        <Link href="/api/auth/logout" className="btn btn-outline">
          Logout
        </Link>
        <Link href="/profile" className="btn btn-primary">
          Profile
        </Link>
      </div>
    );
  }

  return (
    <Link href="/api/auth/login" className="btn btn-primary">
      Login
    </Link>
  );
}