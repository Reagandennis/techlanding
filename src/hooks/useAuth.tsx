import { signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    update,
    signOut: handleSignOut,
  };
}
