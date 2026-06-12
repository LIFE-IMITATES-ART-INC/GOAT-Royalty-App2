// GOAT Royalty App - Supabase Authentication
// Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Supabase configuration - credentials loaded from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Create auth client instance
const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions using real Supabase
export const auth = {
  // Sign up new user
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        return { data: null, error: { message: error.message } }
      }

      // Create user profile in profiles table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: metadata.full_name || 'GOAT Artist',
            role: 'artist',
            created_at: new Date().toISOString()
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  },

  // Sign in existing user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { data: null, error: { message: error.message } }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  },

  // Sign in with OAuth (Google, GitHub, etc.)
  async signInWithOAuth(provider, options = {}) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options
      })

      if (error) {
        return { data: null, error: { message: error.message } }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error ? { message: error.message } : null }
    } catch (error) {
      return { error: { message: error.message } }
    }
  },

  // Get current user
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        return { user: null, error: { message: error.message } }
      }

      // Get user profile from profiles table
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!profileError && profile) {
          user.profile = profile
        }
      }

      return { user, error: null }
    } catch (error) {
      return { user: null, error: { message: error.message } }
    }
  },

  // Get session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        return { session: null, error: { message: error.message } }
      }

      // Get user profile if session exists
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!profileError && profile) {
          session.user.profile = profile
        }
      }

      return { session, error: null }
    } catch (error) {
      return { session: null, error: { message: error.message } }
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/reset-password`
      })

      if (error) {
        return { data: null, error: { message: error.message } }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  },

  // Update user
  async updateUser(updates) {
    try {
      const { data, error } = await supabase.auth.updateUser(updates)

      if (error) {
        return { data: null, error: { message: error.message } }
      }

      // Update profile if provided
      if (data.user && updates.data) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            ...updates.data,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id)

        if (profileError) {
          console.error('Profile update error:', profileError)
        }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Get client for direct access
  getClient() {
    return supabase
  }
}

export default auth