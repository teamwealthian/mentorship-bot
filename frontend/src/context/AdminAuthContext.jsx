import { useEffect, useMemo, useState } from 'react'

import { AdminAuthContext } from './adminAuthContext'
const TOKEN_STORAGE_KEY = 'admin-auth-token'

const readStoredToken = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY) || ''
}

const storeToken = (token) => {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

const clearStoredToken = () => {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken())
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState('')
  const [isInitializing, setIsInitializing] = useState(() => Boolean(readStoredToken()))
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    if (!token) {
      setUser(null)
      setIsInitializing(false)
      return undefined
    }

    let isCancelled = false

    const restoreSession = async () => {
      setIsInitializing(true)

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Your admin session has expired. Please sign in again.')
        }

        if (isCancelled) {
          return
        }

        setUser(data.data?.user || null)
        setAuthError('')
      } catch (error) {
        if (isCancelled) {
          return
        }

        clearStoredToken()
        setToken('')
        setUser(null)
        setAuthError(error.message || 'Unable to restore your admin session.')
      } finally {
        if (!isCancelled) {
          setIsInitializing(false)
        }
      }
    }

    restoreSession()

    return () => {
      isCancelled = true
    }
  }, [token])

  const login = async ({ password, username }) => {
    setIsLoggingIn(true)
    setAuthError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          username,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to sign in.')
      }

      const nextToken = data.data?.token
      const nextUser = data.data?.user

      if (!nextToken || !nextUser) {
        throw new Error('Authentication response was incomplete.')
      }

      storeToken(nextToken)
      setToken(nextToken)
      setUser(nextUser)

      return nextUser
    } catch (error) {
      setAuthError(error.message || 'Unable to sign in.')
      throw error
    } finally {
      setIsLoggingIn(false)
    }
  }

  const logout = (message = '') => {
    clearStoredToken()
    setToken('')
    setUser(null)
    setAuthError(message)
    setIsInitializing(false)
  }

  const value = useMemo(
    () => ({
      authError,
      isAuthenticated: Boolean(token && user),
      isInitializing,
      isLoggingIn,
      login,
      logout,
      token,
      user,
    }),
    [authError, isInitializing, isLoggingIn, token, user],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
