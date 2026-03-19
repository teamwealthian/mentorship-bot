import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAdminAuth } from '../context/useAdminAuth'

function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { authError, isAuthenticated, isInitializing, isLoggingIn, login } = useAdminAuth()
  const [credentials, setCredentials] = useState({
    password: '',
    username: '',
  })
  const [formError, setFormError] = useState('')

  if (isInitializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f3eb] px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
          Checking admin session...
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

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setFormError('Username and password are required.')
      return
    }

    setFormError('')

    try {
      await login({
        password: credentials.password.trim(),
        username: credentials.username.trim(),
      })

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
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Admin sign in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Use your internal admin credentials to access the knowledge training console.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="admin-username" className="mb-2 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              value={credentials.username}
              onChange={(event) => handleChange('username', event.target.value)}
              autoComplete="username"
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

          {(formError || authError) && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {formError || authError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoggingIn ? 'Signing in...' : 'Sign in'}
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
