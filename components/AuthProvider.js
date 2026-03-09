// Auth Provider Component
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/auth'

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateUser: async () => {}
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { session } = await auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    session,
    loading,
    signIn: async (email, password) => {
      setLoading(true)
      try {
        const result = await auth.signIn(email, password)
        return result
      } finally {
        setLoading(false)
      }
    },
    signUp: async (email, password, metadata) => {
      setLoading(true)
      try {
        const result = await auth.signUp(email, password, metadata)
        return result
      } finally {
        setLoading(false)
      }
    },
    signOut: async () => {
      setLoading(true)
      try {
        const result = await auth.signOut()
        setUser(null)
        setSession(null)
        return result
      } finally {
        setLoading(false)
      }
    },
    resetPassword: auth.resetPassword,
    updateUser: async (updates) => {
      try {
        const result = await auth.updateUser(updates)
        if (result.data?.user) {
          setUser(result.data.user)
        }
        return result
      } catch (error) {
        console.error('Error updating user:', error)
        return { data: null, error: { message: error.message } }
      }
    }
  }

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext