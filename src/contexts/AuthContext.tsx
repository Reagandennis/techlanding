'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useSupabaseAuth, AuthUser } from '@/hooks/useSupabaseAuth'
import { Session } from '@supabase/supabase-js'
import { Profile, UserRole } from '@/types/supabase'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signInWithProvider: (provider: 'google' | 'github') => Promise<any>
  signOut: () => Promise<any>
  resetPassword: (email: string) => Promise<any>
  updatePassword: (password: string) => Promise<any>
  updateProfile: (updates: Partial<Profile>) => Promise<any>
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean
  isAdmin: () => boolean
  isInstructor: () => boolean
  isStudent: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useSupabaseAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}