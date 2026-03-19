import { useState } from 'react'

import { useAdminAuth } from '../context/useAdminAuth'

const INITIAL_FORM = {
  confirmPassword: '',
  email: '',
  password: '',
}

export function useAdminUsers() {
  const { logout, token } = useAdminAuth()
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [lastCreatedAdmin, setLastCreatedAdmin] = useState(null)

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const submitAdminUser = async () => {
    const payload = {
      email: form.email.trim(),
      password: form.password.trim(),
    }

    if (!payload.email || !payload.password) {
      setError('Email and password are required.')
      setSuccessMessage('')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      setSuccessMessage('')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/auth/admin-users', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.status === 401 || response.status === 403) {
        logout('Your admin session has expired. Please sign in again.')
        throw new Error(data.message || 'Your admin session has expired. Please sign in again.')
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create admin user.')
      }

      setSuccessMessage(data.message || 'Admin user created successfully.')
      setLastCreatedAdmin(data.data?.user || null)
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
    lastCreatedAdmin,
    submitAdminUser,
    successMessage,
    updateField,
  }
}
