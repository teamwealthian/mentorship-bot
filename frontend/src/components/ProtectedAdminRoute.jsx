import { Navigate, useLocation } from 'react-router-dom'

import { useAdminAuth } from '../context/useAdminAuth'

function ProtectedAdminRoute({ children }) {
  const location = useLocation()
  const { isAuthenticated, isInitializing } = useAdminAuth()

  if (isInitializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f3eb] px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
          Checking admin session...
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedAdminRoute
