import OpenAI from 'openai'

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Anything V1',
  },
})

export const MODEL = 'google/gemini-3-pro-preview'

// Helper for JSON completions
export async function jsonCompletion<T>(
  systemPrompt: string,
  userPrompt: string,
  model: string = MODEL
): Promise<T> {
  const response = await openrouter.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt + '\n\nRespond only with valid JSON, no markdown or explanation.' },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 8192,
  })

  const content = response.choices[0]?.message?.content || '{}'

  // Try to extract JSON if wrapped in markdown code blocks
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const jsonString = jsonMatch ? jsonMatch[1] : content

  return JSON.parse(jsonString.trim()) as T
}
