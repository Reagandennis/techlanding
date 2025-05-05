'use client';



export default function useAuth() {
  const { user, error, isLoading } = useUser();

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
}

function useUser(): { user: any; error: any; isLoading: any; } {
    throw new Error("Function not implemented.");
}
