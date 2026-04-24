import Anthropic from '@anthropic-ai/sdk'

export async function POST(req) {
  try {
    const { city } = await req.json()
    if (!city) return Response.json({ error: 'City is required' }, { status: 400 })

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      system: `You are a weather data assistant for farmers. Search for current weather in the given city and return ONLY a JSON object (no backticks, no markdown) with this structure:
{
  "city": "City, Country",
  "temp_c": number,
  "feels_like_c": number,
  "humidity_pct": number,
  "wind_kmh": number,
  "description": "weather description",
  "condition": "sunny|cloudy|rainy|stormy|foggy|snowy",
  "farming_advice": "2-3 sentences of practical farming advice based on these weather conditions"
}`,
      messages: [{ role: 'user', content: `Get current weather for ${city} and return as JSON.` }]
    })

    const raw = response.content.filter(b => b.type === 'text').map(b => b.text).join('')
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)
    return Response.json(result)
  } catch (err) {
    console.error('Weather API error:', err)
    return Response.json({ error: 'Could not fetch weather. Check the city name.' }, { status: 500 })
  }
}
