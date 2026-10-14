import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { setAccessToken, api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || ''
      const search = window.location.search || ''
      // If token_hash is present, the OTP has not been clicked/verified yet by the user
      if (search.includes('token_hash') || hash.includes('token_hash')) {
        return false
      }
      return (hash.includes('type=recovery') && hash.includes('access_token'))
    }
    return false
  })

  useEffect(() => {
    // 1. Check existing session on load
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setAccessToken(currentSession?.access_token ?? null)
      setIsLoading(false)
    }).catch(() => {
      setIsLoading(false)
    })

    // 2. Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setAccessToken(newSession?.access_token ?? null)
      setIsLoading(false)

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
      }

      if (event === 'SIGNED_IN') {
        const metadata = newSession?.user?.user_metadata || {}
        const isNew = Boolean(metadata.is_new_signup)
        if (isNew) {
          setIsFirstLogin(true)
        }
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { is_new_signup: true },
      },
    })
    if (error) {
      throw new Error(error.message)
    }
    setIsFirstLogin(true)
    return data
  }

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw new Error(error.message)
    }
    return data
  }

  const loginWithGoogle = async () => {
    const redirectUrl = typeof window !== 'undefined' ? window.location.origin : undefined
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
    if (error) {
      throw new Error(error.message)
    }
    return data
  }

  const resetPassword = async (email) => {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password`
      : undefined
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
    if (error) {
      throw new Error(error.message)
    }
    return data
  }

  const verifyOtp = async ({ token_hash, type = 'recovery' }) => {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })
    if (error) {
      throw new Error(error.message)
    }
    setIsPasswordRecovery(true)
    return data
  }

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) {
      throw new Error(error.message)
    }
    setIsPasswordRecovery(false)
    return data
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      setUser(null)
      setSession(null)
      setAccessToken(null)
      setIsPasswordRecovery(false)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('veyra_user_name')
        }
      } catch {
        // ignore
      }
    }
  }

  const deleteAccount = async () => {
    // 1. Purge all records on backend
    await api.deleteAccount()
    // 2. Sign out of Supabase Auth
    await logout()
    // 3. Clear local onboarding flags
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('veyra_onboarding_completed')
        window.localStorage.removeItem('veyra_user_name')
      }
    } catch {
      // ignore
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        token: session?.access_token ?? null,
        isAuthenticated: Boolean(user),
        isLoading,
        isFirstLogin,
        clearFirstLogin: () => setIsFirstLogin(false),
        isPasswordRecovery,
        clearPasswordRecovery: () => setIsPasswordRecovery(false),
        signUp,
        login,
        loginWithGoogle,
        resetPassword,
        updatePassword,
        verifyOtp,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
