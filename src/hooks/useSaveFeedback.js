import { useState, useRef, useEffect } from 'react'

// Drives the "✓ Saved" feedback shown for 2 seconds after saving a stage.
export const useSaveFeedback = () => {
  const [saved, setSaved] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const trigger = () => {
    setSaved(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSaved(false), 2000)
  }

  return [saved, trigger]
}
