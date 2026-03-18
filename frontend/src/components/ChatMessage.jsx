function ChatMessage({ role, content }) {
  const isAssistant = role === 'assistant'

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] rounded-[20px] px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[70%] ${
          isAssistant
            ? 'rounded-tl-md border border-slate-200 bg-white text-slate-800'
            : 'rounded-br-md bg-slate-900 text-white'
        }`}
      >
        {content}
      </div>
    </div>
  )
}

export default ChatMessage
