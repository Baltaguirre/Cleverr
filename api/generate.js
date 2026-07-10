import Anthropic from '@anthropic-ai/sdk'
import { buildRequest } from '../lib/prompts.js'

// Vercel serverless function. Drafts stage content with Claude and returns it
// to the client for review. The Anthropic key stays server-side; access is
// gated by a shared passphrase so the public endpoint can't drain credit.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }

  const expected = process.env.APP_PASSPHRASE
  const provided = req.headers['x-app-passphrase']
  if (!expected || provided !== expected) {
    res.status(401).json({ error: 'Invalid or missing access passphrase.' })
    return
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY.' })
    return
  }

  const { stage, topic, resource } = req.body || {}
  const request = buildRequest(stage, topic, { resource })
  if (!request) {
    res.status(400).json({ error: `Unknown stage: ${stage}` })
    return
  }

  const client = new Anthropic()

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      system: request.system,
      output_config: { format: { type: 'json_schema', schema: request.schema } },
      messages: [{ role: 'user', content: request.prompt }],
    })

    const text = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')

    const data = JSON.parse(text)
    res.status(200).json(request.mode === 'coaching' ? { coaching: data.coaching } : { fields: data })
  } catch (error) {
    console.error('generate error', error)
    res.status(502).json({ error: 'Generation failed. Check the server logs and that the API key has credit.' })
  }
}
