import { KNOWLEDGE_TYPE_OPTIONS } from '../constants/knowledgeTypes'

function AdminKnowledgeForm({
  error,
  form,
  isSubmitting,
  lastSubmission,
  onChange,
  onSubmit,
  successMessage,
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">Train the sales bot</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Add product knowledge, FAQs, objections, scripts, and testimonials. Each
          submission is stored in MongoDB, chunked, embedded, and sent to Pinecone for
          retrieval.
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
          <label
            htmlFor="knowledge-type"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Knowledge type
          </label>
          <select
            id="knowledge-type"
            value={form.type}
            onChange={(event) => onChange('type', event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
          >
            {KNOWLEDGE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="knowledge-content"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Knowledge content
          </label>
          <textarea
            id="knowledge-content"
            rows="10"
            value={form.content}
            onChange={(event) => onChange('content', event.target.value)}
            placeholder="Paste product details, FAQs, objection-handling lines, or testimonials here..."
            className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
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
          {isSubmitting ? 'Submitting...' : 'Add knowledge'}
        </button>
      </form>

      {lastSubmission && (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">Latest submission</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-800">Type:</span> {lastSubmission.type}
            </p>
            <p>
              <span className="font-medium text-slate-800">Status:</span>{' '}
              {lastSubmission.status}
            </p>
            <p>
              <span className="font-medium text-slate-800">Created:</span>{' '}
              {lastSubmission.createdAt}
            </p>
            <p>
              <span className="font-medium text-slate-800">Chunks created:</span>{' '}
              {lastSubmission.chunksCreated}
            </p>
            <p>
              <span className="font-medium text-slate-800">Pinecone indexing:</span>{' '}
              {lastSubmission.vectorUpsert?.enabled
                ? `${lastSubmission.vectorUpsert.upsertedCount} chunk(s) upserted`
                : 'Skipped because Pinecone is not configured'}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminKnowledgeForm
