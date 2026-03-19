import { useCallback, useEffect, useMemo, useState } from 'react'

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

const parseResponseBody = async (response) => {
  const rawBody = await response.text()

  if (!rawBody) {
    return {
      data: null,
      rawBody: '',
    }
  }

  try {
    return {
      data: JSON.parse(rawBody),
      rawBody,
    }
  } catch {
    return {
      data: null,
      rawBody,
    }
  }
}

const getResponseMessage = ({ fallbackMessage, payload, rawBody }) =>
  payload?.message || rawBody || fallbackMessage

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken())
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState('')
  const [isInitializing, setIsInitializing] = useState(() => Boolean(readStoredToken()))
  const [isCheckingSetup, setIsCheckingSetup] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [requiresBootstrap, setRequiresBootstrap] = useState(false)

  const applySession = useCallback(({ token: nextToken, user: nextUser }) => {
    if (!nextToken || !nextUser) {
      throw new Error('Authentication response was incomplete.')
    }

    storeToken(nextToken)
    setToken(nextToken)
    setUser(nextUser)
    setRequiresBootstrap(false)
  }, [])

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
        const { data, rawBody } = await parseResponseBody(response)

        if (!response.ok) {
          throw new Error(
            getResponseMessage({
              fallbackMessage: 'Your admin session has expired. Please sign in again.',
              payload: data,
              rawBody,
            }),
          )
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

  const refreshBootstrapStatus = useCallback(async () => {
    setIsCheckingSetup(true)

    try {
      const response = await fetch('/api/auth/bootstrap-status')
      const { data, rawBody } = await parseResponseBody(response)

      if (!response.ok) {
        throw new Error(
          getResponseMessage({
            fallbackMessage: 'Unable to check admin setup status.',
            payload: data,
            rawBody,
          }),
        )
      }

      const shouldBootstrap = Boolean(data?.data?.requiresBootstrap)
      setAuthError('')
      setRequiresBootstrap(shouldBootstrap)
      return shouldBootstrap
    } catch (error) {
      setAuthError(error.message || 'Unable to check admin setup status.')
      throw error
    } finally {
      setIsCheckingSetup(false)
    }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    setIsLoggingIn(true)
    setAuthError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })
      const { data, rawBody } = await parseResponseBody(response)

      if (!response.ok) {
        throw new Error(
          getResponseMessage({
            fallbackMessage: 'Unable to sign in.',
            payload: data,
            rawBody,
          }),
        )
      }

      applySession(data.data)
      return data.data?.user
    } catch (error) {
      setAuthError(error.message || 'Unable to sign in.')
      throw error
    } finally {
      setIsLoggingIn(false)
    }
  }, [applySession])

  const bootstrap = useCallback(async ({ email, password }) => {
    setIsBootstrapping(true)
    setAuthError('')

    try {
      const response = await fetch('/api/auth/bootstrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })
      const { data, rawBody } = await parseResponseBody(response)

      if (!response.ok) {
        throw new Error(
          getResponseMessage({
            fallbackMessage: 'Unable to create the first admin account.',
            payload: data,
            rawBody,
          }),
        )
      }

      applySession(data.data)
      return data.data?.user
    } catch (error) {
      setAuthError(error.message || 'Unable to create the first admin account.')
      throw error
    } finally {
      setIsBootstrapping(false)
    }
  }, [applySession])

  const logout = useCallback((message = '') => {
    clearStoredToken()
    setToken('')
    setUser(null)
    setAuthError(message)
    setIsInitializing(false)
  }, [])

  const value = useMemo(
    () => ({
      authError,
      bootstrap,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      isCheckingSetup,
      isInitializing,
      isLoggingIn,
      login,
      logout,
      refreshBootstrapStatus,
      requiresBootstrap,
      token,
      user,
    }),
    [
      authError,
      bootstrap,
      isBootstrapping,
      isCheckingSetup,
      isInitializing,
      isLoggingIn,
      login,
      logout,
      refreshBootstrapStatus,
      requiresBootstrap,
      token,
      user,
    ],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
