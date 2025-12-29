import { jsonCompletion, openrouter } from '@/lib/openrouter/client'
import type { AgentContext } from './types'
import type { BrandColors, BusinessCanvas, MarketResearch } from '@/types'

const ARTIST_SYSTEM_PROMPT = `You are a brand identity designer. Your job is to create a cohesive brand identity for a business.

Based on the business information, create a complete brand identity.

Return a JSON object with this exact structure:
{
  "brand_colors": {
    "primary": "#XXXXXX - main brand color",
    "secondary": "#XXXXXX - secondary color",
    "accent": "#XXXXXX - accent/highlight color",
    "background": "#XXXXXX - background color",
    "text": "#XXXXXX - text color"
  },
  "brand_voice": "string - description of how the brand communicates (tone, style, personality)",
  "logo_prompt": "string - detailed prompt for AI logo generation, describing style, elements, colors"
}

Important:
- Colors must be valid hex codes
- Ensure sufficient contrast between background and text colors
- Primary color should reflect the brand personality
- Logo prompt should describe a simple, memorable design suitable for various sizes`

interface ArtistOutput {
  brand_colors: BrandColors
  brand_voice: string
  logo_url: string | null
}

interface BrandDesign {
  brand_colors: BrandColors
  brand_voice: string
  logo_prompt: string
}

export async function runArtist(ctx: AgentContext): Promise<ArtistOutput> {
  const { business, previousOutputs, emit } = ctx
  const marketResearch = previousOutputs.market_research as MarketResearch
  const businessName = previousOutputs.business_name as string
  const businessCanvas = previousOutputs.business_canvas as BusinessCanvas

  emit({
    type: 'agent_progress',
    agent: 'artist',
    message: 'Designing brand identity...',
    progress: 0,
  })

  const userPrompt = `
Business Name: ${businessName}
Business Idea: ${business.prompt}

Value Proposition: ${businessCanvas.value_proposition}
Target Audience: ${marketResearch.target_audience}
Industry: ${marketResearch.industry}

Create a brand identity that:
1. Appeals to the target audience
2. Differentiates from competitors
3. Reflects the value proposition
4. Is modern and professional`

  emit({
    type: 'agent_progress',
    agent: 'artist',
    message: 'Selecting color palette...',
    progress: 20,
  })

  const brandDesign = await jsonCompletion<BrandDesign>(
    ARTIST_SYSTEM_PROMPT,
    userPrompt
  )

  emit({
    type: 'agent_progress',
    agent: 'artist',
    message: 'Generating logo...',
    progress: 50,
  })

  // Generate logo using OpenRouter image generation
  let logoUrl: string | null = null

  try {
    const logoPrompt = `A modern, minimal logo for "${businessName}". ${brandDesign.logo_prompt}. Simple, clean, vector style, white background, professional business logo.`

    const response = await openrouter.images.generate({
      model: 'black-forest-labs/flux-pro',
      prompt: logoPrompt,
      size: '1024x1024',
    } as any)

    if (response.data && response.data.length > 0) {
      logoUrl = response.data[0].url || null
    }
  } catch (error) {
    console.error('Logo generation failed:', error)
    // Continue without logo - it's optional
  }

  emit({
    type: 'agent_progress',
    agent: 'artist',
    message: 'Brand identity complete!',
    progress: 100,
  })

  return {
    brand_colors: brandDesign.brand_colors,
    brand_voice: brandDesign.brand_voice,
    logo_url: logoUrl,
  }
}
