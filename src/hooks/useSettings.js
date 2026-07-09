import { useState, useEffect } from 'react'

// Stores the AI access passphrase in localStorage. The Anthropic key itself
// never lives in the browser — it stays server-side behind /api/generate.
const STORAGE_KEY = 'lf_passphrase'

export const useSettings = () => {
  const [passphrase, setPassphrase] = useState(() => localStorage.getItem(STORAGE_KEY) || '')

  useEffect(() => {
    if (passphrase) {
      localStorage.setItem(STORAGE_KEY, passphrase)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [passphrase])

  return { passphrase, setPassphrase }
}
