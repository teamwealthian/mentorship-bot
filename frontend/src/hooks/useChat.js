import { useEffect, useMemo, useRef, useState } from 'react'

const STORAGE_KEY_PREFIX = 'ai-sales-chat-messages'
const INTRO_TYPING_BASE_DELAY_MS = 550
const INTRO_TYPING_PER_CHARACTER_MS = 16
const INTRO_TYPING_MAX_DELAY_MS = 1600
const INTRO_MESSAGE_PAUSE_MS = 180
const REPLY_TYPING_BASE_DELAY_MS = 320
const REPLY_TYPING_PER_CHARACTER_MS = 12
const REPLY_TYPING_MAX_DELAY_MS = 900
const REPLY_MESSAGE_PAUSE_MS = 140
const REPLY_WORD_BASE_DELAY_MS = 55
const REPLY_WORD_PUNCTUATION_DELAY_MS = 95

export const DEFAULT_COURSE_TITLE = '6-Month Mentorship Program on Options Trading'

const DEFAULT_LANGUAGE = 'English'
const HINDI_LANGUAGE = 'Hindi'

const normalizeStorageSegment = (value) => {
  if (typeof value !== 'string') {
    return 'default'
  }

  const normalizedValue = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalizedValue || 'default'
}

export const createChatStorageKey = ({ courseTitle, userName, storageScope }) =>
  `${STORAGE_KEY_PREFIX}:${normalizeStorageSegment(courseTitle)}:${normalizeStorageSegment(
    userName || 'guest',
  )}:${normalizeStorageSegment(storageScope || 'default')}`

const buildInitialMessages = ({ courseTitle, userName, preferredLanguage }) => {
  if (preferredLanguage === HINDI_LANGUAGE) {
    return [
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: userName ? `Namaste ${userName}, Kundan here.` : 'Namaste, Kundan here.',
      },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `${courseTitle} mein aapki dilchaspi dekhkar accha laga.`,
      },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Aap sabse pehle kya jaan na chahenge?',
      },
    ]
  }

  return [
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: userName ? `Hi ${userName}, Kundan here.` : 'Hi, Kundan here.',
    },
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Welcome! Great to see your interest in ${courseTitle}.`,
    },
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'What would you like to explore first?',
    },
  ]
}

const QUICK_REPLIES_BY_LANGUAGE = {
  [DEFAULT_LANGUAGE]: ['Course details', 'Fees', 'Who is it for?', 'Talk to an advisor'],
  [HINDI_LANGUAGE]: ['Course details', 'Fees', 'Yeh kiske liye hai?', 'Advisor se baat karni hai'],
}

const normalizeAssistantMessages = (messages, fallback = '') => {
  const normalizedMessages = (Array.isArray(messages) ? messages : [])
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)

  if (normalizedMessages.length > 0) {
    return normalizedMessages
  }

  return typeof fallback === 'string' && fallback.trim() ? [fallback.trim()] : []
}

const getIntroTypingDelay = (content, index) => {
  const lengthBasedDelay = content.length * INTRO_TYPING_PER_CHARACTER_MS
  const firstMessageBonus = index === 0 ? 120 : 0

  return Math.min(
    INTRO_TYPING_BASE_DELAY_MS + lengthBasedDelay + firstMessageBonus,
    INTRO_TYPING_MAX_DELAY_MS,
  )
}

const getReplyTypingDelay = (content, index) =>
  Math.min(
    REPLY_TYPING_BASE_DELAY_MS +
      content.length * REPLY_TYPING_PER_CHARACTER_MS +
      index * 90,
    REPLY_TYPING_MAX_DELAY_MS,
  )

const getReplyWordDelay = (word) =>
  /[,.!?]$/.test(word) ? REPLY_WORD_PUNCTUATION_DELAY_MS : REPLY_WORD_BASE_DELAY_MS

const normalizeStoredMessages = (value) => {
  if (!Array.isArray(value)) {
    return []
  }

  const normalizedMessages = value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      id: typeof item.id === 'string' && item.id ? item.id : crypto.randomUUID(),
      role: item.role === 'user' ? 'user' : 'assistant',
      content: typeof item.content === 'string' ? item.content.trim() : '',
    }))
    .filter((item) => item.content)

  return normalizedMessages
}

const getStoredMessages = (storageKey) => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedMessages = window.localStorage.getItem(storageKey)

    if (!storedMessages) {
      return null
    }

    const normalizedMessages = normalizeStoredMessages(JSON.parse(storedMessages))

    return normalizedMessages.length > 0 ? normalizedMessages : null
  } catch {
    return null
  }
}

export function useChat({
  courseTitle = DEFAULT_COURSE_TITLE,
  userName = '',
  preferredLanguage = DEFAULT_LANGUAGE,
  storageScope = '',
} = {}) {
  const storageKey = useMemo(
    () => createChatStorageKey({ courseTitle, userName, storageScope }),
    [courseTitle, storageScope, userName],
  )
  const initialMessages = useMemo(
    () => buildInitialMessages({ courseTitle, userName, preferredLanguage }),
    [courseTitle, preferredLanguage, userName],
  )
  const quickReplies = useMemo(
    () => QUICK_REPLIES_BY_LANGUAGE[preferredLanguage] || QUICK_REPLIES_BY_LANGUAGE[DEFAULT_LANGUAGE],
    [preferredLanguage],
  )
  const languageInstruction = useMemo(
    () =>
      preferredLanguage === HINDI_LANGUAGE
        ? 'The user prefers Hindi. Reply in natural Hindi or Hinglish unless they ask otherwise.'
        : 'The user prefers English. Reply in English unless they ask otherwise.',
    [preferredLanguage],
  )
  const storedMessages = useMemo(() => getStoredMessages(storageKey), [storageKey])
  const [messages, setMessages] = useState(() => storedMessages || [])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isReplyTyping, setIsReplyTyping] = useState(false)
  const [isReplyStreaming, setIsReplyStreaming] = useState(false)
  const [error, setError] = useState('')
  const [isIntroTyping, setIsIntroTyping] = useState(() => !storedMessages)
  const timeoutRef = useRef(null)

  const canSend = useMemo(
    () =>
      input.trim().length > 0 &&
      !isIntroTyping &&
      !isLoading &&
      !isReplyTyping &&
      !isReplyStreaming,
    [input, isIntroTyping, isLoading, isReplyStreaming, isReplyTyping],
  )
  const showQuickReplies = useMemo(
    () =>
      !isIntroTyping &&
      !isReplyTyping &&
      !isReplyStreaming &&
      messages.length >= initialMessages.length &&
      messages.every((message) => message.role === 'assistant'),
    [initialMessages.length, isIntroTyping, isReplyStreaming, isReplyTyping, messages],
  )

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(messages))
  }, [messages, storageKey])

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (storedMessages) {
      return undefined
    }

    setMessages([])
    setIsIntroTyping(true)

    let timeoutId

    const revealMessage = (index) => {
      if (index >= initialMessages.length) {
        setIsIntroTyping(false)
        return
      }

      timeoutId = window.setTimeout(() => {
        setMessages((current) => [...current, initialMessages[index]])

        if (index === initialMessages.length - 1) {
          setIsIntroTyping(false)
          return
        }

        revealMessage(index + 1)
      }, getIntroTypingDelay(initialMessages[index].content, index) + INTRO_MESSAGE_PAUSE_MS)
    }

    revealMessage(0)

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [initialMessages, storedMessages])

  const wait = (delay) =>
    new Promise((resolve) => {
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null
        resolve()
      }, delay)
    })

  const streamAssistantMessage = async (content) => {
    const assistantMessageId = crypto.randomUUID()
    const words = content.split(/\s+/).filter(Boolean)

    setMessages((current) => [
      ...current,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
      },
    ])

    setIsReplyStreaming(true)

    let partialContent = ''

    for (const word of words) {
      partialContent = partialContent ? `${partialContent} ${word}` : word

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId ? { ...message, content: partialContent } : message,
        ),
      )

      await wait(getReplyWordDelay(word))
    }

    setIsReplyStreaming(false)
  }

  const playAssistantReply = async (assistantMessages) => {
    for (const [index, assistantMessage] of assistantMessages.entries()) {
      setIsReplyTyping(true)
      await wait(getReplyTypingDelay(assistantMessage, index))
      setIsReplyTyping(false)
      await streamAssistantMessage(assistantMessage)

      if (index < assistantMessages.length - 1) {
        await wait(REPLY_MESSAGE_PAUSE_MS)
      }
    }
  }

  const sendMessage = async (draft) => {
    const content = draft.trim()

    if (!content || isIntroTyping || isLoading || isReplyTyping || isReplyStreaming) {
      return
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    }

    setError('')
    setIsLoading(true)
    setMessages((current) => [...current, userMessage])
    setInput('')

    try {
      const history = [
        {
          role: 'system',
          content: languageInstruction,
        },
        ...[...messages, userMessage].slice(-10).map(({ role, content: messageContent }) => ({
          role,
          content: messageContent,
        })),
      ]

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          history,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.message || 'Failed to get response from server.')
      }

      const assistantMessages = normalizeAssistantMessages(
        payload.data.assistantMessages,
        payload.data.assistantMessage,
      )

      if (assistantMessages.length === 0) {
        throw new Error('Assistant returned an empty reply.')
      }

      setIsLoading(false)
      await playAssistantReply(assistantMessages)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
      setIsReplyTyping(false)
      setIsReplyStreaming(false)
    }
  }

  return {
    canSend,
    error,
    input,
    isIntroTyping,
    isLoading,
    isReplyTyping,
    messages,
    quickReplies,
    sendMessage,
    setInput,
    showQuickReplies,
  }
}
