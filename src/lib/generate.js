// Frontend client for the /api/generate serverless proxy.
export const generateStage = async (stage, topic, passphrase) => {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-app-passphrase': passphrase || '',
    },
    body: JSON.stringify({ stage, topic }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${response.status}).`)
  }

  return response.json()
}
