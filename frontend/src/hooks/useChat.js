import { useEffect, useMemo, useRef, useState } from 'react'

import {
  buildPostScriptMessages,
  DEFAULT_LANGUAGE,
  HINDI_LANGUAGE,
  QUICK_REPLIES_BY_LANGUAGE,
  SCRIPT_FLOW_BY_LANGUAGE,
} from '../constants/chatScript'

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
const SCRIPT_STATE_VERSION = 2

export const DEFAULT_COURSE_TITLE = '6-Month Mentorship Program on Options Trading'

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
    REPLY_TYPING_BASE_DELAY_MS + content.length * REPLY_TYPING_PER_CHARACTER_MS + index * 90,
    REPLY_TYPING_MAX_DELAY_MS,
  )

const getReplyWordDelay = (word) =>
  /[,.!?]$/.test(word) ? REPLY_WORD_PUNCTUATION_DELAY_MS : REPLY_WORD_BASE_DELAY_MS

const normalizeStoredMessages = (value) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      id: typeof item.id === 'string' && item.id ? item.id : crypto.randomUUID(),
      role: item.role === 'user' ? 'user' : 'assistant',
      content: typeof item.content === 'string' ? item.content.trim() : '',
    }))
    .filter((item) => item.content)
}

const getStoredChatState = (storageKey) => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawState = window.localStorage.getItem(storageKey)

    if (!rawState) {
      return null
    }

    const parsedState = JSON.parse(rawState)

    if (Array.isArray(parsedState)) {
      const messages = normalizeStoredMessages(parsedState)
      const hasSentAiUserMessage = messages.some((message) => message.role === 'user')

      return {
        messages,
        scriptNodeId: null,
        composerEnabled: true,
        showAiQuickReplies: !hasSentAiUserMessage,
        hasSentAiUserMessage,
      }
    }

    if (!parsedState || typeof parsedState !== 'object') {
      return null
    }

    const messages = normalizeStoredMessages(parsedState.messages)

    return {
      messages,
      scriptNodeId: typeof parsedState.scriptNodeId === 'string' ? parsedState.scriptNodeId : null,
      composerEnabled: Boolean(parsedState.composerEnabled),
      showAiQuickReplies: Boolean(parsedState.showAiQuickReplies),
      hasSentAiUserMessage: Boolean(parsedState.hasSentAiUserMessage),
      version: parsedState.version,
    }
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
  const scriptFlow = useMemo(
    () => SCRIPT_FLOW_BY_LANGUAGE[preferredLanguage] || SCRIPT_FLOW_BY_LANGUAGE[DEFAULT_LANGUAGE],
    [preferredLanguage],
  )
  const postScriptMessages = useMemo(
    () => buildPostScriptMessages({ courseTitle, preferredLanguage }),
    [courseTitle, preferredLanguage],
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
  const storedState = useMemo(() => getStoredChatState(storageKey), [storageKey])
  const [messages, setMessages] = useState(() => storedState?.messages || [])
  const [scriptNodeId, setScriptNodeId] = useState(
    () => storedState?.scriptNodeId || scriptFlow.initialNodeId,
  )
  const [composerEnabled, setComposerEnabled] = useState(() => storedState?.composerEnabled || false)
  const [showAiQuickReplies, setShowAiQuickReplies] = useState(
    () => storedState?.showAiQuickReplies || false,
  )
  const [hasSentAiUserMessage, setHasSentAiUserMessage] = useState(
    () => storedState?.hasSentAiUserMessage || false,
  )
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isReplyTyping, setIsReplyTyping] = useState(false)
  const [isReplyStreaming, setIsReplyStreaming] = useState(false)
  const [error, setError] = useState('')
  const [isIntroTyping, setIsIntroTyping] = useState(() => !storedState)
  const timeoutRef = useRef(null)
  const initialScriptPlayedRef = useRef(Boolean(storedState))

  const canSend = useMemo(
    () =>
      composerEnabled &&
      input.trim().length > 0 &&
      !isIntroTyping &&
      !isLoading &&
      !isReplyTyping &&
      !isReplyStreaming,
    [composerEnabled, input, isIntroTyping, isLoading, isReplyStreaming, isReplyTyping],
  )
  const showQuickReplies = useMemo(
    () =>
      composerEnabled &&
      showAiQuickReplies &&
      !hasSentAiUserMessage &&
      !isIntroTyping &&
      !isReplyTyping &&
      !isReplyStreaming,
    [
      composerEnabled,
      hasSentAiUserMessage,
      isIntroTyping,
      isReplyStreaming,
      isReplyTyping,
      showAiQuickReplies,
    ],
  )
  const scriptOptions = useMemo(() => {
    if (!scriptNodeId || isIntroTyping) {
      return []
    }

    return scriptFlow.nodes[scriptNodeId]?.options || []
  }, [isIntroTyping, scriptFlow.nodes, scriptNodeId])

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        version: SCRIPT_STATE_VERSION,
        messages,
        scriptNodeId,
        composerEnabled,
        showAiQuickReplies,
        hasSentAiUserMessage,
      }),
    )
  }, [composerEnabled, hasSentAiUserMessage, messages, scriptNodeId, showAiQuickReplies, storageKey])

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    },
    [],
  )

  const wait = (delay) =>
    new Promise((resolve) => {
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null
        resolve()
      }, delay)
    })

  const revealAssistantSequence = async (assistantMessages) => {
    const normalizedMessages = normalizeAssistantMessages(assistantMessages)

    if (normalizedMessages.length === 0) {
      return
    }

    setIsIntroTyping(true)

    for (const [index, assistantMessage] of normalizedMessages.entries()) {
      await wait(getIntroTypingDelay(assistantMessage, index) + INTRO_MESSAGE_PAUSE_MS)
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: assistantMessage,
        },
      ])
    }

    setIsIntroTyping(false)
  }

  useEffect(() => {
    if (initialScriptPlayedRef.current) {
      return undefined
    }

    initialScriptPlayedRef.current = true
    setMessages([])
    setComposerEnabled(false)
    setShowAiQuickReplies(false)
    setHasSentAiUserMessage(false)

    let isCancelled = false

    const playInitialScript = async () => {
      await revealAssistantSequence(scriptFlow.nodes[scriptFlow.initialNodeId]?.assistantMessages || [])

      if (isCancelled) {
        return
      }

      setScriptNodeId(scriptFlow.initialNodeId)
    }

    playInitialScript()

    return () => {
      isCancelled = true
      initialScriptPlayedRef.current = false
    }
  }, [scriptFlow])

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

  const completeScriptBranch = async (completionMode) => {
    setScriptNodeId(null)

    if (completionMode === 'composer') {
      setComposerEnabled(true)
      setShowAiQuickReplies(false)
      return
    }

    await revealAssistantSequence(postScriptMessages)
    setComposerEnabled(true)
    setShowAiQuickReplies(true)
  }

  const selectScriptOption = async (option) => {
    const currentNode = scriptNodeId ? scriptFlow.nodes[scriptNodeId] : null

    if (
      !currentNode ||
      !currentNode.options?.includes(option) ||
      isIntroTyping ||
      isLoading ||
      isReplyTyping ||
      isReplyStreaming
    ) {
      return
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: option,
    }

    setError('')
    setShowAiQuickReplies(false)
    setMessages((current) => [...current, userMessage])

    const nextNodeId = currentNode.nextByOption?.[option]
    const nextNode = nextNodeId ? scriptFlow.nodes[nextNodeId] : null

    setScriptNodeId(null)

    if (!nextNode) {
      setComposerEnabled(true)
      return
    }

    await revealAssistantSequence(nextNode.assistantMessages || [])

    if (nextNode.options?.length) {
      setScriptNodeId(nextNodeId)
      return
    }

    await completeScriptBranch(nextNode.completionMode)
  }

  const sendMessage = async (draft) => {
    const content = draft.trim()

    if (
      !content ||
      !composerEnabled ||
      isIntroTyping ||
      isLoading ||
      isReplyTyping ||
      isReplyStreaming
    ) {
      return
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    }

    setError('')
    setIsLoading(true)
    setHasSentAiUserMessage(true)
    setShowAiQuickReplies(false)
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
  }
}
