'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { Profile, UserRole } from '@/types/supabase'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  profile: Profile
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user (more secure than getSession)
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Error getting user:', error)
        setLoading(false)
        return
      }

      if (user) {
        await fetchUserProfile(user)
        // Get session separately for session data
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
      }
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        
        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      if (profile) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          role: profile.role,
          profile
        })
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signInWithProvider = async (provider: 'google' | 'github') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setSession(null)
    }
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  }

  const updatePassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password })
    return { data, error }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      setUser({
        ...user,
        profile: data
      })
    }

    return { data, error }
  }

  const hasRole = (requiredRole: UserRole | UserRole[]) => {
    if (!user) return false
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role)
    }
    
    return user.role === requiredRole
  }

  const isAdmin = () => hasRole('ADMIN')
  const isInstructor = () => hasRole(['INSTRUCTOR', 'ADMIN'])
  const isStudent = () => hasRole('STUDENT')

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    hasRole,
    isAdmin,
    isInstructor,
    isStudent
  }
}