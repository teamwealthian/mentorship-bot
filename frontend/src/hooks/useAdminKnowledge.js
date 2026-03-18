import { useState } from 'react'

import { KNOWLEDGE_TYPE_OPTIONS } from '../constants/knowledgeTypes'

const INITIAL_FORM = {
  type: KNOWLEDGE_TYPE_OPTIONS[0].value,
  content: '',
}

export function useAdminKnowledge() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [lastSubmission, setLastSubmission] = useState(null)

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const submitKnowledge = async () => {
    const payload = {
      type: form.type.trim(),
      content: form.content.trim(),
    }

    if (!payload.content) {
      setError('Knowledge content is required.')
      setSuccessMessage('')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/admin/add-knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add knowledge.')
      }

      setSuccessMessage(data.message || 'Knowledge submitted successfully.')
      setLastSubmission(data.data || null)
      setForm(INITIAL_FORM)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    error,
    form,
    isSubmitting,
    lastSubmission,
    successMessage,
    submitKnowledge,
    updateField,
  }
}
