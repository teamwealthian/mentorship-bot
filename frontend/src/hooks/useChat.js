import { useMemo, useState } from 'react'

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

export function useChat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const canSend = useMemo(
    () => input.trim().length > 0 && !isLoading,
    [input, isLoading],
  )

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
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
  }
}
