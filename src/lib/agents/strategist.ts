import { jsonCompletion } from '@/lib/openrouter/client'
import type { AgentContext } from './types'
import type { BusinessCanvas, MarketResearch } from '@/types'

const STRATEGIST_SYSTEM_PROMPT = `You are a business strategist and startup expert. Your job is to create a comprehensive business model canvas and naming for a new business.

Based on the business idea and market research, create a complete business strategy.

Return a JSON object with this exact structure:
{
  "business_name": "string - a memorable, unique business name",
  "tagline": "string - a catchy tagline under 10 words",
  "business_canvas": {
    "value_proposition": "string - clear value proposition statement",
    "problem": "string - the main problem being solved",
    "solution": "string - how the business solves it",
    "customer_segments": ["string - target customer segments"],
    "channels": ["string - distribution and marketing channels"],
    "revenue_streams": [
      {
        "name": "string",
        "type": "subscription | one-time | commission | advertising | freemium",
        "pricing": "string - specific pricing",
        "description": "string"
      }
    ],
    "key_resources": ["string - essential resources needed"],
    "key_activities": ["string - core business activities"],
    "key_partnerships": ["string - strategic partners"],
    "cost_structure": [
      {
        "item": "string",
        "type": "fixed | variable",
        "amount": "string - estimated cost"
      }
    ],
    "unfair_advantage": "string - what makes this hard to copy"
  }
}

Be specific with pricing and costs. Make the business name unique and memorable.`

interface StrategistOutput {
  business_name: string
  tagline: string
  business_canvas: BusinessCanvas
}

export async function runStrategist(ctx: AgentContext): Promise<StrategistOutput> {
  const { business, previousOutputs, emit } = ctx
  const marketResearch = previousOutputs.market_research as MarketResearch

  emit({
    type: 'agent_progress',
    agent: 'strategist',
    message: 'Analyzing business opportunity...',
    progress: 0,
  })

  emit({
    type: 'agent_progress',
    agent: 'strategist',
    message: 'Crafting business model...',
    progress: 30,
  })

  const userPrompt = `
Business Idea: ${business.prompt}

Market Research Summary:
- Industry: ${marketResearch.industry}
- Market Size: ${marketResearch.market_size}
- Growth Trend: ${marketResearch.growth_trend}
- Target Audience: ${marketResearch.target_audience}

Competitors:
${marketResearch.competitors.map((c) => `- ${c.name}: ${c.description}`).join('\n')}

Opportunities:
${marketResearch.opportunities.map((o) => `- ${o}`).join('\n')}

Threats:
${marketResearch.threats.map((t) => `- ${t}`).join('\n')}

Create a complete business strategy including a unique name, tagline, and comprehensive business model canvas.`

  emit({
    type: 'agent_progress',
    agent: 'strategist',
    message: 'Defining revenue model...',
    progress: 60,
  })

  const result = await jsonCompletion<StrategistOutput>(
    STRATEGIST_SYSTEM_PROMPT,
    userPrompt
  )

  emit({
    type: 'agent_progress',
    agent: 'strategist',
    message: 'Business strategy complete!',
    progress: 100,
  })

  return result
}
