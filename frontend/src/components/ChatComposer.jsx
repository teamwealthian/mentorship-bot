function ChatComposer({ canSend, input, isLoading, onChange, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="sticky bottom-0 z-10 shrink-0 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6"
    >
      <div className="flex items-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-2 shadow-sm">
        <input
          type="text"
          value={input}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type a question anytime..."
          className="h-10 flex-1 border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          aria-label={isLoading ? 'Sending message' : 'Send message'}
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <span className="text-lg">↗</span>
          )}
        </button>
      </div>
    </form>
  )
}

export default ChatComposer
