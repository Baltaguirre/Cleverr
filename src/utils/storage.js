// Persistence layer — the whole app state lives in localStorage under a single key.
const STORAGE_KEY = 'lf_topics'

export const loadTopics = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (error) {
    console.error('Failed to load topics from localStorage', error)
    return []
  }
}

export const saveTopics = (topics) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics))
  } catch (error) {
    console.error('Failed to save topics to localStorage', error)
  }
}
