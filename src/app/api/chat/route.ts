import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { openrouter, MODEL } from '@/lib/openrouter/client'

// Map sections to their corresponding database fields
const SECTION_TO_FIELDS: Record<string, string[]> = {
  overview: ['business_canvas', 'market_research'],
  brand: ['brand_colors', 'brand_voice', 'business_name', 'tagline'],
  website: ['website_structure'],
  flow: ['customer_journey', 'automation_flows'],
}

export async function POST(request: NextRequest) {
  try {
    const { businessId, message, context, model } = await request.json()

    if (!businessId || !message) {
      return NextResponse.json(
        { error: 'Business ID and message are required' },
        { status: 400 }
      )
    }

    const isEditMode = context?.mode === 'edit'
    const currentSection = context?.section || 'overview'

    // Use provided model or fallback to default
    const selectedModel = model || MODEL

    const supabase = createAdminClient()

    // Get business data for context
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Get chat history
    const { data: history } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true })
      .limit(20)

    // Save user message
    await supabase.from('chat_messages').insert({
      business_id: businessId,
      role: 'user',
      content: message,
      context,
    })

    // Build context-aware system prompt based on mode
    let systemPrompt: string

    if (isEditMode) {
      const relevantFields = SECTION_TO_FIELDS[currentSection] || []
      const currentData: Record<string, unknown> = {}
      for (const field of relevantFields) {
        if (business[field]) {
          currentData[field] = business[field]
        }
      }

      systemPrompt = `You are an AI assistant that edits business data. The user wants to modify their ${currentSection} section.

Current data for this section:
${JSON.stringify(currentData, null, 2)}

IMPORTANT: You must respond with a JSON object containing two fields:
1. "message": A friendly message explaining what you changed
2. "updates": An object with the fields to update (only include fields that need to change)

Available fields you can update: ${relevantFields.join(', ')}

Example response format:
{
  "message": "I've updated your tagline to be more catchy and memorable.",
  "updates": {
    "tagline": "New tagline here"
  }
}

If the user's request is unclear or you need clarification, respond with just the message field and no updates.`
    } else {
      systemPrompt = `You are an AI assistant helping to refine a business plan for "${business.business_name || 'a new business'}".

Business Context:
- Original Idea: ${business.prompt}
- Business Name: ${business.business_name || 'Not yet named'}
- Tagline: ${business.tagline || 'Not yet created'}
- Value Proposition: ${business.business_canvas?.value_proposition || 'Not yet defined'}
- Target Audience: ${business.market_research?.target_audience || 'Not yet identified'}

${currentSection ? `The user is currently viewing the ${currentSection} section.` : ''}

Help the user refine and improve their business content. Be specific and actionable.
If the user asks to change something, provide the updated content they can use.`
    }

    // Build messages array
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...(history || []).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // Get response from OpenRouter
    const response = await openrouter.chat.completions.create({
      model: selectedModel,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    })

    const rawResponse = response.choices[0]?.message?.content || ''
    let assistantMessage = rawResponse
    let updates: Record<string, unknown> | null = null

    // In edit mode, try to parse the response as JSON
    if (isEditMode) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
        const jsonString = jsonMatch ? jsonMatch[1] : rawResponse

        const parsed = JSON.parse(jsonString.trim())

        if (parsed.message) {
          assistantMessage = parsed.message
        }

        if (parsed.updates && Object.keys(parsed.updates).length > 0) {
          // Return proposed updates - don't apply immediately
          // User will confirm via "Go with the plan" button
          updates = parsed.updates
        }
      } catch {
        // If JSON parsing fails, just use the raw response
        console.log('Response was not JSON, using raw message')
      }
    }

    // Save assistant response
    await supabase.from('chat_messages').insert({
      business_id: businessId,
      role: 'assistant',
      content: assistantMessage,
      context,
    })

    return NextResponse.json({
      message: assistantMessage,
      proposedUpdates: updates,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    )
  }
}
