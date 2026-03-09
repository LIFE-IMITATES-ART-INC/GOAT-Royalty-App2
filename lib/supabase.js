// GOAT Royalty App - Supabase Integration
// Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST

import { createClient } from '@supabase/supabase-js'

// Supabase configuration - using real project credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://xmvlnonsxmrpvlssjstl.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key-for-build'

// Create Supabase client (gracefully handles missing keys during build)
let supabase
try {
  supabase = createClient(supabaseUrl, supabaseKey)
} catch (error) {
  console.warn('Supabase client creation failed, using mock client:', error.message)
  supabase = {
    from: () => ({
      select: () => ({ data: [], error: null, eq: () => ({ data: [], error: null, single: () => ({ data: null, error: null }), order: () => ({ data: [], error: null }) }) }),
      insert: () => ({ data: null, error: null, select: () => ({ single: () => ({ data: null, error: null }) }) }),
      update: () => ({ data: null, error: null, eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
      delete: () => ({ eq: () => ({ error: null }) }),
    }),
    auth: {
      getSession: () => ({ data: { session: null }, error: null }),
      getUser: () => ({ data: { user: null }, error: null }),
      signInWithPassword: () => ({ data: null, error: null }),
      signUp: () => ({ data: null, error: null }),
      signOut: () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    }
  }
}

// Helper functions for database operations
export const supabaseHelpers = {
  // Get user tracks
  async getUserTracks(userId) {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user tracks:', error)
      return []
    }
  },

  // Get user royalties
  async getUserRoyalties(userId) {
    try {
      const { data, error } = await supabase
        .from('royalties')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user royalties:', error)
      return []
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create default
          return await this.createProfile(userId)
        }
        throw error
      }
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  // Create user profile
  async createProfile(userId, profileData = {}) {
    try {
      const defaultProfile = {
        id: userId,
        name: 'GOAT Artist',
        email: 'artist@goatroyaltyapp.com',
        role: 'artist',
        created_at: new Date().toISOString(),
        ...profileData
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert(defaultProfile)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating user profile:', error)
      return null
    }
  },

  // Save track data
  async saveTrack(trackData) {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .insert({
          ...trackData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving track:', error)
      return null
    }
  },

  // Update track data
  async updateTrack(trackId, updates) {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', trackId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating track:', error)
      return null
    }
  },

  // Delete track
  async deleteTrack(trackId) {
    try {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting track:', error)
      return false
    }
  },

  // Get analytics data
  async getAnalytics(userId) {
    try {
      const [tracks, royalties, contracts] = await Promise.all([
        this.getUserTracks(userId),
        this.getUserRoyalties(userId),
        this.getUserContracts(userId)
      ])

      return {
        totalTracks: tracks.length,
        totalRoyalties: royalties.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
        totalContracts: contracts.length,
        recentActivity: [...tracks, ...royalties]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      return {
        totalTracks: 0,
        totalRoyalties: 0,
        totalContracts: 0,
        recentActivity: []
      }
    }
  },

  // Get user contracts
  async getUserContracts(userId) {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user contracts:', error)
      return []
    }
  },

  // Save royalty data
  async saveRoyalty(royaltyData) {
    try {
      const { data, error } = await supabase
        .from('royalties')
        .insert({
          ...royaltyData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error saving royalty:', error)
      return null
    }
  },

  // Update royalty data
  async updateRoyalty(royaltyId, updates) {
    try {
      const { data, error } = await supabase
        .from('royalties')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', royaltyId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating royalty:', error)
      return null
    }
  },

  // Test connection
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })

      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          return { connected: true, tablesExist: false, error: 'Tables not found' }
        }
        throw error
      }
      return { connected: true, tablesExist: true, data }
    } catch (error) {
      return { connected: false, error: error.message }
    }
  }
}

// Export the client and helper functions
export { supabase }
export default supabase