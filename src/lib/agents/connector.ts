import { jsonCompletion } from '@/lib/openrouter/client'
import type { AgentContext } from './types'
import type {
  CustomerJourney,
  AutomationFlow,
  BusinessCanvas,
  MarketResearch,
  WebsiteStructure,
} from '@/types'

const CONNECTOR_SYSTEM_PROMPT = `You are a customer experience designer and automation expert. Your job is to design customer journeys and automation flows for a business.

Based on the business information, create a comprehensive customer journey and automation strategy.

Return a JSON object with this exact structure:
{
  "customer_journey": {
    "stages": [
      {
        "name": "Awareness | Consideration | Decision | Purchase | Onboarding | Retention | Advocacy",
        "description": "string - what happens at this stage",
        "touchpoints": ["string - customer touchpoints"],
        "actions": ["string - customer actions"],
        "emotions": "string - customer emotional state",
        "kpis": ["string - metrics to track"]
      }
    ]
  },
  "automation_flows": [
    {
      "name": "string - flow name",
      "description": "string - what this automation does",
      "trigger": "string - what triggers this flow",
      "steps": [
        {
          "action": "string - action to take",
          "details": "string - specific details",
          "delay": "string - time delay before this step (optional)"
        }
      ],
      "tools": ["string - recommended tools/platforms"]
    }
  ]
}

Create all 7 journey stages (Awareness, Consideration, Decision, Purchase, Onboarding, Retention, Advocacy).
Create at least 4 automation flows that will save time and improve customer experience.`

interface ConnectorOutput {
  customer_journey: CustomerJourney
  automation_flows: AutomationFlow[]
}

export async function runConnector(ctx: AgentContext): Promise<ConnectorOutput> {
  const { business, previousOutputs, emit } = ctx
  const marketResearch = previousOutputs.market_research as MarketResearch
  const businessName = previousOutputs.business_name as string
  const businessCanvas = previousOutputs.business_canvas as BusinessCanvas
  const websiteStructure = previousOutputs.website_structure as WebsiteStructure

  emit({
    type: 'agent_progress',
    agent: 'connector',
    message: 'Mapping customer journey...',
    progress: 0,
  })

  const websitePages = websiteStructure?.pages?.map((p) => p.name).join(', ') || 'Home'

  emit({
    type: 'agent_progress',
    agent: 'connector',
    message: 'Identifying touchpoints...',
    progress: 30,
  })

  const userPrompt = `
Business Name: ${businessName}
Business Idea: ${business.prompt}

Value Proposition: ${businessCanvas.value_proposition}
Target Audience: ${marketResearch.target_audience}

Customer Segments:
${businessCanvas.customer_segments.map((s) => `- ${s}`).join('\n')}

Channels:
${businessCanvas.channels.map((c) => `- ${c}`).join('\n')}

Revenue Streams:
${businessCanvas.revenue_streams.map((r) => `- ${r.name}: ${r.type} - ${r.pricing}`).join('\n')}

Website Pages: ${websitePages}

Key Activities:
${businessCanvas.key_activities.map((a) => `- ${a}`).join('\n')}

Design a complete customer journey from first awareness to becoming an advocate.
Also design automation flows that will:
1. Nurture leads
2. Onboard new customers
3. Retain existing customers
4. Encourage referrals`

  emit({
    type: 'agent_progress',
    agent: 'connector',
    message: 'Designing automation flows...',
    progress: 60,
  })

  const result = await jsonCompletion<ConnectorOutput>(
    CONNECTOR_SYSTEM_PROMPT,
    userPrompt
  )

  emit({
    type: 'agent_progress',
    agent: 'connector',
    message: 'Customer flow complete!',
    progress: 100,
  })

  return result
}
