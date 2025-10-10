'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/auth-helpers-nextjs';

interface AuthUser extends User {
  role?: string;
  profile?: {
    id: string;
    email: string;
    name?: string;
    role: string;
    [key: string]: any;
  };
}

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export default function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  const fetchUserProfile = async (authUser: User): Promise<AuthUser> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Return user with basic info if profile fetch fails
        return {
          ...authUser,
          role: 'STUDENT',
          profile: null
        };
      }

      return {
        ...authUser,
        role: profile.role,
        profile: profile
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return {
        ...authUser,
        role: 'STUDENT',
        profile: null
      };
    }
  };

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        setError(authError.message);
        setUser(null);
        return;
      }

      if (authUser) {
        const userWithProfile = await fetchUserProfile(authUser);
        setUser(userWithProfile);
        setError(null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setError('Failed to refresh user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
      } else {
        setUser(null);
        setError(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  useEffect(() => {
    // Get initial session
    refreshUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        const userWithProfile = await fetchUserProfile(session.user);
        setUser(userWithProfile);
        setError(null);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    signOut,
    refreshUser,
  };
}

// Export the hook as both default and named export for compatibility
export { useAuth };
