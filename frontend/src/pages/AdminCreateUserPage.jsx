import { Link } from 'react-router-dom'

import AdminUserManagementForm from '../components/AdminUserManagementForm'
import { useAdminAuth } from '../context/useAdminAuth'
import { useAdminUsers } from '../hooks/useAdminUsers'

function AdminCreateUserPage() {
  const { logout, user } = useAdminAuth()
  const {
    error,
    form,
    isSubmitting,
    lastCreatedAdmin,
    submitAdminUser,
    successMessage,
    updateField,
  } = useAdminUsers()

  return (
    <main className="min-h-screen bg-[#f5f3eb] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">
              Internal Access
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Create Admin User</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Use this internal screen to add another admin who can access the protected
              console.
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Signed in as <span className="font-medium text-slate-800">{user?.email}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <Link
              to="/admin"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
            >
              Back to admin
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
            >
              Sign out
            </button>
          </div>
        </div>

        <AdminUserManagementForm
          error={error}
          form={form}
          isSubmitting={isSubmitting}
          lastCreatedAdmin={lastCreatedAdmin}
          onChange={updateField}
          onSubmit={submitAdminUser}
          successMessage={successMessage}
        />
      </div>
    </main>
  )
}

export default AdminCreateUserPage
