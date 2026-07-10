// Frontend client for the /api/generate serverless proxy.
// `extra` carries stage-specific payloads (e.g. { resource } for a card summary).
export const generateStage = async (stage, topic, passphrase, extra = {}) => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-app-passphrase': passphrase || '',
    },
    body: JSON.stringify({ stage, topic, ...extra }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${response.status}).`)
  }

  return response.json()
}
