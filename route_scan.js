import Anthropic from '@anthropic-ai/sdk'

export async function POST(req) {
  try {
    const { base64 } = await req.json()
    if (!base64) return Response.json({ error: 'No image provided' }, { status: 400 })

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are an expert agricultural scientist and plant pathologist. Analyze crop images and respond ONLY with a valid JSON object (no markdown, no backticks) with this exact structure:
{
  "status": "healthy" | "diseased" | "deficient" | "pest_damage" | "uncertain",
  "condition": "Short name of condition (max 5 words)",
  "severity": "None" | "Mild" | "Moderate" | "Severe",
  "confidence": "High" | "Medium" | "Low",
  "crop_type": "Identified crop or Unknown",
  "summary": "2-3 sentence description of what you see and the diagnosis",
  "treatment": "2-3 specific actionable treatment recommendations",
  "prevention": "1-2 prevention tips for the future"
}`,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
          { type: 'text', text: 'Analyze this crop image and provide a detailed diagnosis in the requested JSON format.' }
        ]
      }]
    })

    const raw = response.content.map(b => b.text || '').join('')
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)
    return Response.json(result)
  } catch (err) {
    console.error('Scan API error:', err)
    return Response.json({ error: err.message || 'Analysis failed' }, { status: 500 })
  }
}
