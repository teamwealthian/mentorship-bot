import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import ChatComposer from '../components/ChatComposer'
import ChatMessage from '../components/ChatMessage'
import MentorSidebar from '../components/MentorSidebar'
import QuickReplyButtons from '../components/QuickReplyButtons'
import {
  createChatStorageKey,
  DEFAULT_COURSE_TITLE,
  useChat,
} from '../hooks/useChat'

const ONBOARDING_STATE_PREFIX = 'ai-sales-onboarding'
const PREFERRED_LANGUAGE_PREFIX = 'ai-sales-preferred-language'
const LANGUAGE_OPTIONS = ['Hindi', 'English']
const LANGUAGE_CONFIRMATION_CONTENT = {
  English: {
    description:
      'Live classes in the mentorship program will be conducted in both Hindi and English. You will be added to the Hindi batch.',
  },
  Hindi: {
    description:
      'Mentorship program mein live classes Hindi aur English dono mein hongi. Aapko Hindi batch mein add kiya jayega',
  },
}

const createOnboardingStateKey = (courseTitle) =>
  `${ONBOARDING_STATE_PREFIX}:${courseTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'default'}`

const createPreferredLanguageKey = (courseTitle) =>
  `${PREFERRED_LANGUAGE_PREFIX}:${courseTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'default'}`

function ChatExperience({ courseTitle, onStartOver, preferredLanguage }) {
  const {
    canSend,
    composerEnabled,
    error,
    input,
    isIntroTyping,
    isLoading,
    isReplyTyping,
    messages,
    quickReplies,
    scriptOptions,
    selectScriptOption,
    sendMessage,
    setInput,
    showQuickReplies,
  } = useChat({
    courseTitle,
    preferredLanguage,
    storageScope: preferredLanguage,
  })
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [isIntroTyping, isLoading, isReplyTyping, messages])

  const handleSubmit = async (event) => {
    event.preventDefault()
    await sendMessage(input)
  }

  return (
    <main className="flex h-screen overflow-hidden bg-slate-200/40">
      <MentorSidebar courseTitle={courseTitle} />

      <section className="flex min-h-0 flex-1 flex-col bg-[#f7f5ef]">
        <header className="shrink-0 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                KK
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">Kundan Kishore</p>
                <p className="text-sm text-slate-500">{courseTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {preferredLanguage ? (
                <div className="hidden rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 sm:block">
                  {preferredLanguage}
                </div>
              ) : null}

              <button
                type="button"
                onClick={onStartOver}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                Start over
              </button>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
            {messages.map((message) => (
              <div key={message.id}>
                <ChatMessage role={message.role} content={message.content} />
              </div>
            ))}

            {(isIntroTyping || isLoading || isReplyTyping) && (
              <div className="flex justify-start">
                <div
                  className="chat-typing-indicator rounded-[20px] rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm"
                  aria-label="Assistant is typing"
                >
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" />
                </div>
              </div>
            )}

            {scriptOptions.length > 0 && (
              <div className="chat-message-enter flex justify-end">
                <QuickReplyButtons options={scriptOptions} onSelect={selectScriptOption} />
              </div>
            )}

            {showQuickReplies && (
              <div className="chat-message-enter mt-3">
                <QuickReplyButtons options={quickReplies} onSelect={sendMessage} />
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

        {composerEnabled ? (
          <ChatComposer
            canSend={canSend}
            input={input}
            isLoading={isLoading}
            onChange={setInput}
            onSubmit={handleSubmit}
          />
        ) : null}
      </section>
    </main>
  )
}

function CourseChatPage({ courseTitle }) {
  const onboardingStateKey = useMemo(
    () => createOnboardingStateKey(courseTitle),
    [courseTitle],
  )
  const preferredLanguageKey = useMemo(
    () => createPreferredLanguageKey(courseTitle),
    [courseTitle],
  )
  const [preferredLanguage, setPreferredLanguage] = useState(() => {
    if (typeof window === 'undefined') {
      return ''
    }

    return window.sessionStorage.getItem(preferredLanguageKey) || ''
  })
  const [step, setStep] = useState(() => {
    if (typeof window === 'undefined') {
      return 'welcome'
    }

    const storedLanguage = window.sessionStorage.getItem(preferredLanguageKey)
    const isOnboardingComplete = window.sessionStorage.getItem(onboardingStateKey) === 'complete'

    if (isOnboardingComplete && storedLanguage) {
      return 'chat'
    }

    if (storedLanguage) {
      return 'details'
    }

    return 'welcome'
  })

  const handleStartOver = () => {
    if (typeof window !== 'undefined') {
      const chatStorageKey = createChatStorageKey({
        courseTitle,
        storageScope: preferredLanguage,
      })

      window.sessionStorage.removeItem(onboardingStateKey)
      window.sessionStorage.removeItem(preferredLanguageKey)
      window.localStorage.removeItem(chatStorageKey)
    }

    setPreferredLanguage('')
    setStep('welcome')
  }

  const handleSelectLanguage = (language) => {
    if (!LANGUAGE_OPTIONS.includes(language) || typeof window === 'undefined') {
      return
    }

    window.sessionStorage.setItem(preferredLanguageKey, language)

    setPreferredLanguage(language)
    setStep('details')
  }

  const handleStartChat = () => {
    if (!preferredLanguage || typeof window === 'undefined') {
      return
    }

    window.sessionStorage.setItem(onboardingStateKey, 'complete')
    setStep('chat')
  }

  if (step === 'chat') {
    return (
      <ChatExperience
        key={`${courseTitle}:${preferredLanguage}`}
        courseTitle={courseTitle}
        onStartOver={handleStartOver}
        preferredLanguage={preferredLanguage}
      />
    )
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f5ef] px-4 py-8 sm:px-6 lg:px-8">
      <div className="welcome-glow absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-200/45 blur-3xl" />
      <div className="welcome-glow-delayed absolute bottom-12 right-[8%] h-56 w-56 rounded-full bg-slate-900/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(247,245,239,0.98))]" />

      <section className="relative z-10 flex w-full max-w-4xl items-center justify-center">
        <div className="w-full max-w-3xl">
          {step === 'welcome' ? (
            <div className="flex flex-col items-center gap-12 text-center">
              <h1 className="welcome-fade-up-delayed mx-auto max-w-lg text-4xl font-semibold leading-[1.1] tracking-tight text-slate-950 sm:text-5xl">
                What is your preferred language for the mentorship?
              </h1>
              <div className="welcome-fade-up flex w-full max-w-md flex-col items-center gap-5">
                {LANGUAGE_OPTIONS.map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => handleSelectLanguage(language)}
                    className="inline-flex w-full items-center justify-center rounded-full border border-slate-900/10 bg-slate-950 px-10 py-5 text-xl font-semibold tracking-[0.01em] text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800 sm:text-2xl"
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="welcome-fade-up mx-auto flex max-w-xl flex-col items-center rounded-[36px] border border-white/70 bg-white/78 px-7 py-12 text-center shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur sm:px-10 sm:py-14">
              <p className="max-w-lg text-xl font-medium leading-9 text-slate-700 sm:text-2xl sm:leading-10">
                {LANGUAGE_CONFIRMATION_CONTENT[preferredLanguage]?.description}
              </p>
              <div className="mt-10 flex w-full justify-center">
                <button
                  type="button"
                  onClick={handleStartChat}
                  className="inline-flex min-w-56 items-center justify-center rounded-full bg-slate-950 px-10 py-5 text-lg font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Let&apos;s Talk !
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function ChatPage() {
  const [searchParams] = useSearchParams()
  const courseTitle = useMemo(
    () => searchParams.get('courseTitle')?.trim() || DEFAULT_COURSE_TITLE,
    [searchParams],
  )

  return <CourseChatPage key={courseTitle} courseTitle={courseTitle} />
}

export default ChatPage
