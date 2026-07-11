import { useState } from 'react'
import { generateStage } from '../lib/generate'

// Cache generated drafts per topic + stage so re-opening a stage doesn't pay
// for another API call. Key includes the topic id so topics never share drafts.
const cacheKey = (topic, stage, kind) => `gen:${topic?.id ?? 'none'}:${stage}:${kind}`

const readCache = (topic, stage, kind) => {
  try {
    const raw = localStorage.getItem(cacheKey(topic, stage, kind))
    return raw ? JSON.parse(raw) : null
  } catch {
    // Corrupt / legacy value (e.g. the string "undefined") — treat as a miss.
    return null
  }
}

const writeCache = (topic, stage, kind, value) => {
  if (value === undefined || value === null) return
  try {
    localStorage.setItem(cacheKey(topic, stage, kind), JSON.stringify(value))
  } catch {
    // Ignore quota / serialization failures — the cache is best-effort.
  }
}

const removeCache = (topic, stage, kind) => localStorage.removeItem(cacheKey(topic, stage, kind))

// Drives an AI generation call for one stage: loading/error state plus the
// resulting field suggestions (review-before-apply) or coaching text. Each
// stage returns EITHER fields OR coaching, so a run makes at most one API call.
export const useGeneration = (stage, getTopic, passphrase) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState(null)
  const [coaching, setCoaching] = useState('')

  const run = async () => {
    setLoading(true)
    setError('')
    try {
      const topic = getTopic()

      const cachedFields = readCache(topic, stage, 'suggestions')
      if (cachedFields) {
        setSuggestions(cachedFields)
        return
      }
      const cachedCoaching = readCache(topic, stage, 'coaching')
      if (cachedCoaching) {
        setCoaching(cachedCoaching)
        return
      }

      const data = await generateStage(stage, topic, passphrase)
      if (data.fields) {
        setSuggestions(data.fields)
        writeCache(topic, stage, 'suggestions', data.fields)
      }
      if (data.coaching) {
        setCoaching(data.coaching)
        writeCache(topic, stage, 'coaching', data.coaching)
      }
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
      const remaining = Object.keys(next).length ? next : null
      const topic = getTopic()
      if (remaining) writeCache(topic, stage, 'suggestions', remaining)
      else removeCache(topic, stage, 'suggestions')
      return remaining
    })

  const clearSuggestions = () => {
    removeCache(getTopic(), stage, 'suggestions')
    setSuggestions(null)
  }

  return { loading, error, suggestions, coaching, setCoaching, run, dismiss, clearSuggestions }
}
