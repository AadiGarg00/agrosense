import Anthropic from '@anthropic-ai/sdk'

export async function POST(req) {
  try {
    const { messages } = await req.json()
    if (!messages?.length) return Response.json({ error: 'Messages required' }, { status: 400 })

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are AgroSense Expert, a knowledgeable agricultural AI assistant specializing in crop science, soil health, irrigation, pest management, and sustainable farming. Provide practical, actionable advice. Keep responses concise (2-4 paragraphs). Use simple language suitable for farmers. When appropriate, mention specific product names, timings, or quantities.`,
      messages,
    })

    const text = response.content.map(b => b.text || '').join('')
    return Response.json({ reply: text })
  } catch (err) {
    console.error('Chat API error:', err)
    return Response.json({ error: err.message || 'Chat failed' }, { status: 500 })
  }
}
