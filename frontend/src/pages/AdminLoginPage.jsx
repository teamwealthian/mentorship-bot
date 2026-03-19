import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAdminAuth } from '../context/useAdminAuth'

function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    authError,
    bootstrap,
    isAuthenticated,
    isBootstrapping,
    isCheckingSetup,
    isInitializing,
    isLoggingIn,
    login,
    refreshBootstrapStatus,
    requiresBootstrap,
  } = useAdminAuth()
  const [credentials, setCredentials] = useState({
    confirmPassword: '',
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isAuthenticated || isInitializing) {
      return
    }

    refreshBootstrapStatus().catch(() => {
      // The auth provider exposes setup errors through authError.
    })
  }, [isAuthenticated, isInitializing, refreshBootstrapStatus])

  if (isInitializing || isCheckingSetup) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f3eb] px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
          {isInitializing ? 'Checking admin session...' : 'Checking admin setup...'}
        </div>
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const handleChange = (field, value) => {
    setCredentials((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!credentials.email.trim() || !credentials.password.trim()) {
      setFormError('Email and password are required.')
      return
    }

    if (requiresBootstrap && credentials.password !== credentials.confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    setFormError('')

    try {
      if (requiresBootstrap) {
        await bootstrap({
          email: credentials.email.trim(),
          password: credentials.password.trim(),
        })
      } else {
        await login({
          email: credentials.email.trim(),
          password: credentials.password.trim(),
        })
      }

      const destination =
        typeof location.state?.from === 'string' ? location.state.from : '/admin'

      navigate(destination, { replace: true })
    } catch {
      // The auth provider already exposes the message for display.
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f3eb] px-4 py-10 sm:px-6">
      <section className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">
          Internal Access
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          {requiresBootstrap ? 'Create first admin' : 'Admin sign in'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {requiresBootstrap
            ? 'Set up the first admin account for this application. This screen is only available before any admin exists.'
            : 'Use your admin email and password to access the knowledge training console.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={credentials.email}
              onChange={(event) => handleChange('email', event.target.value)}
              autoComplete="email"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={credentials.password}
              onChange={(event) => handleChange('password', event.target.value)}
              autoComplete="current-password"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
            />
          </div>

          {requiresBootstrap && (
            <div>
              <label
                htmlFor="admin-confirm-password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>
              <input
                id="admin-confirm-password"
                type="password"
                value={credentials.confirmPassword}
                onChange={(event) => handleChange('confirmPassword', event.target.value)}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
              />
            </div>
          )}

          {(formError || authError) && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {formError || authError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn || isBootstrapping}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {requiresBootstrap
              ? isBootstrapping
                ? 'Creating admin...'
                : 'Create first admin'
              : isLoggingIn
                ? 'Signing in...'
                : 'Sign in'}
          </button>
        </form>

        <Link
          to="/"
          className="mt-6 inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          Back to public chat
        </Link>
      </section>
    </main>
  )
}

export default AdminLoginPage
