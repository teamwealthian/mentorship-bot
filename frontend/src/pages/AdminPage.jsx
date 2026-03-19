import { Link } from 'react-router-dom'

import AdminKnowledgeForm from '../components/AdminKnowledgeForm'
import { useAdminAuth } from '../context/useAdminAuth'
import { useAdminKnowledge } from '../hooks/useAdminKnowledge'

function AdminPage() {
  const { logout, user } = useAdminAuth()
  const {
    error,
    form,
    isSubmitting,
    lastSubmission,
    successMessage,
    submitKnowledge,
    updateField,
  } = useAdminKnowledge()

  return (
    <main className="min-h-screen bg-[#f5f3eb] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">
              Admin Panel
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Knowledge Training Console
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Use this screen to teach the AI sales agent about your product, FAQs,
              objections, and testimonials.
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Signed in as <span className="font-medium text-slate-800">{user?.username}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
            >
              Back to chat
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

        <AdminKnowledgeForm
          error={error}
          form={form}
          isSubmitting={isSubmitting}
          lastSubmission={lastSubmission}
          onChange={updateField}
          onSubmit={submitKnowledge}
          successMessage={successMessage}
        />
      </div>
    </main>
  )
}

export default AdminPage
