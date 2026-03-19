function AdminUserManagementForm({
  error,
  form,
  isSubmitting,
  lastCreatedAdmin,
  onChange,
  onSubmit,
  successMessage,
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">Create admin user</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Add another internal admin who can sign in to the protected console and manage
          the knowledge base.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
        className="space-y-5"
      >
        <div>
          <label htmlFor="new-admin-email" className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="new-admin-email"
            type="email"
            value={form.email}
            onChange={(event) => onChange('email', event.target.value)}
            autoComplete="email"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          />
        </div>

        <div>
          <label
            htmlFor="new-admin-password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            id="new-admin-password"
            type="password"
            value={form.password}
            onChange={(event) => onChange('password', event.target.value)}
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          />
        </div>

        <div>
          <label
            htmlFor="new-admin-confirm-password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Confirm password
          </label>
          <input
            id="new-admin-confirm-password"
            type="password"
            value={form.confirmPassword}
            onChange={(event) => onChange('confirmPassword', event.target.value)}
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? 'Creating...' : 'Create admin'}
        </button>
      </form>

      {lastCreatedAdmin && (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">Latest admin created</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-800">Email:</span>{' '}
              {lastCreatedAdmin.email}
            </p>
            <p>
              <span className="font-medium text-slate-800">Role:</span> {lastCreatedAdmin.role}
            </p>
            <p>
              <span className="font-medium text-slate-800">Status:</span>{' '}
              {lastCreatedAdmin.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminUserManagementForm
