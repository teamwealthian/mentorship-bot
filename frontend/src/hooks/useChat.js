import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'ai-sales-chat-messages'

const INITIAL_MESSAGES = [
  {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: 'Hi, Kundan here.',
  },
  {
    id: crypto.randomUUID(),
    role: 'assistant',
    content:
      'Thanks for showing interest in our Mentorship program on Options Trading.',
  },
  {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: 'Which language are you comfortable with?',
  },
]

const QUICK_REPLIES = ['Hindi', 'English']

const normalizeStoredMessages = (value) => {
  if (!Array.isArray(value)) {
    return INITIAL_MESSAGES
  }

  const normalizedMessages = value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      id: typeof item.id === 'string' && item.id ? item.id : crypto.randomUUID(),
      role: item.role === 'user' ? 'user' : 'assistant',
      content: typeof item.content === 'string' ? item.content.trim() : '',
    }))
    .filter((item) => item.content)

  return normalizedMessages.length > 0 ? normalizedMessages : INITIAL_MESSAGES
}

const getInitialMessages = () => {
  if (typeof window === 'undefined') {
    return INITIAL_MESSAGES
  }

  try {
    const storedMessages = window.localStorage.getItem(STORAGE_KEY)

    if (!storedMessages) {
      return INITIAL_MESSAGES
    }

    return normalizeStoredMessages(JSON.parse(storedMessages))
  } catch {
    return INITIAL_MESSAGES
  }
}

export function useChat() {
  const [messages, setMessages] = useState(getInitialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const canSend = useMemo(
    () => input.trim().length > 0 && !isLoading,
    [input, isLoading],
  )
  const showQuickReplies = useMemo(
    () => messages.every((message) => message.role === 'assistant'),
    [messages],
  )

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  const sendMessage = async (draft) => {
    const content = draft.trim()

    if (!content || isLoading) {
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
      const history = messages.slice(-10).map(({ role, content: messageContent }) => ({
        role,
        content: messageContent,
      }))

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

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: payload.data.assistantMessage,
        },
      ])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    canSend,
    error,
    input,
    isLoading,
    messages,
    quickReplies: QUICK_REPLIES,
    sendMessage,
    setInput,
    showQuickReplies,
  }
}
