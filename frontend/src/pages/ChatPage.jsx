import { useEffect, useRef } from 'react'

import ChatComposer from '../components/ChatComposer'
import ChatMessage from '../components/ChatMessage'
import MentorSidebar from '../components/MentorSidebar'
import QuickReplyButtons from '../components/QuickReplyButtons'
import { useChat } from '../hooks/useChat'

function ChatPage() {
  const {
    canSend,
    error,
    input,
    isLoading,
    messages,
    quickReplies,
    sendMessage,
    setInput,
    showQuickReplies,
  } = useChat()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [isLoading, messages])

  const handleSubmit = async (event) => {
    event.preventDefault()
    await sendMessage(input)
  }

  return (
    <main className="flex h-screen overflow-hidden bg-slate-200/40">
      <MentorSidebar />

      <section className="flex min-h-0 flex-1 flex-col bg-[#f7f5ef]">
        <header className="shrink-0 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                KK
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">Kundan Kishore</p>
                <p className="text-sm text-slate-500">
                  6-Month Mentorship Program on Options Trading
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
            {messages.map((message, index) => (
              <div key={message.id}>
                <ChatMessage role={message.role} content={message.content} />

                {index === 2 && showQuickReplies && (
                  <div className="mt-3">
                    <QuickReplyButtons options={quickReplies} onSelect={sendMessage} />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-[20px] rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  Typing...
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatComposer
          canSend={canSend}
          input={input}
          isLoading={isLoading}
          onChange={setInput}
          onSubmit={handleSubmit}
        />
      </section>
    </main>
  )
}

export default ChatPage
