import { useState } from 'react'
import { generateStage } from '../lib/generate'

// Drives an AI generation call for one stage: loading/error state plus the
// resulting field suggestions (review-before-apply) or coaching text.
export const useGeneration = (stage, getTopic, passphrase) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState(null)
  const [coaching, setCoaching] = useState('')

  const run = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await generateStage(stage, getTopic(), passphrase)
      if (data.fields) setSuggestions(data.fields)
      if (data.coaching) setCoaching(data.coaching)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const dismiss = (field) =>
    setSuggestions((prev) => {
      if (!prev) return prev
      const next = { ...prev }
      delete next[field]
      return Object.keys(next).length ? next : null
    })

  const clearSuggestions = () => setSuggestions(null)

  return { loading, error, suggestions, coaching, setCoaching, run, dismiss, clearSuggestions }
}
